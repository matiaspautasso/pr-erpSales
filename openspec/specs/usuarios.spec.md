# Spec: Usuarios

## Descripción
ABM de usuarios del sistema. Todos los usuarios son **administradores** (rol único, sin distinción de permisos).
Un usuario existente invita a un nuevo usuario por email; el invitado recibe una contraseña provisoria y puede
usarla o cambiarla. El email y el nombre de usuario son inmutables una vez creados. La única forma de
"darse de baja" es que otro usuario lo elimine — no existe el estado *inactivo*.

Accesible desde `/usuarios`. Requiere sesión activa.

---

## Reglas globales

- **R-USR-01** — Solo existe el rol implícito `admin`. No hay otros roles ni permisos granulares.
- **R-USR-02** — Cualquier usuario autenticado puede invitar y eliminar otros usuarios.
- **R-USR-03** — Email y `username` son **inmutables** una vez creado el usuario. No hay endpoint para modificarlos.
- **R-USR-04** — Un usuario solo tiene dos estados efectivos: **activo** (existe en DB) o **eliminado** (hard delete + bloqueo de login). No existe *inactivo*.
- **R-USR-05** — Un usuario NO puede eliminarse a sí mismo.
- **R-USR-06** — No se puede eliminar al **último** usuario del sistema (siempre debe quedar al menos 1).
- **R-USR-07** — La contraseña provisoria generada al invitar MUST cumplir `@MinLength(8)` y MUST ser aleatoria (no derivada del email).
- **R-USR-08** — La invitación se envía por email vía `MailerService` (Gmail SMTP). El email incluye: username, contraseña provisoria, link a `/login`.
- **R-USR-09** — Al loguearse por primera vez con la contraseña provisoria, el usuario puede operar normalmente. Cambiar la contraseña es opcional (vía UC-AUTH-04).

---

## Modelo de datos

### Entidad `User` (ampliada respecto al MVP)
```
- id: number (PK)
- username: string (UNIQUE, NOT NULL, inmutable post-creación)
- email: string (UNIQUE, NOT NULL, inmutable post-creación)
- password_hash: string (bcrypt, rounds >= 10)
- must_change_password: boolean (default true al invitar; false al usar `change-password`)
- invited_by_user_id: number | null (FK -> users.id, registro de quién invitó)
- created_at: timestamp
```

> **Nota**: No hay columna `role`, `is_active`, `deleted_at`. R-USR-04 obliga a hard-delete.

---

## UC-USR-01 — Listar usuarios

### Happy Path

**Scenario: listado normal**
```
Given el usuario está autenticado
  And existen N usuarios en el sistema
When navega a /usuarios
Then MUST mostrar tabla con columnas: username, email, invitado por, fecha de alta, acciones
  And MUST mostrar botón "Invitar usuario" en el header
  And cada fila (excepto la del propio usuario) MUST mostrar botón "Eliminar"
  And la fila del propio usuario MUST mostrar etiqueta "Vos" en lugar del botón eliminar
```

**Scenario: único usuario**
```
Given solo hay 1 usuario en el sistema (el propio)
Then la fila MUST mostrar etiqueta "Vos"
  And NOT debe haber botón eliminar
  And MUST mostrar aviso "Sos el único usuario. Invitá a otro para poder eliminarte luego."
```

---

## UC-USR-02 — Invitar usuario por email

### Happy Path

**Scenario: invitación exitosa**
```
Given el usuario autenticado completa el formulario { username: "santi", email: "santi@x.com" }
  And username no existe en la tabla
  And email no existe en la tabla
When envía POST /api/usuarios/invite
Then MUST generar una contraseña provisoria aleatoria de >= 8 caracteres
  And MUST crear el user con must_change_password=true, invited_by_user_id=<actor.id>
  And MUST enviar email a santi@x.com con:
      - asunto: "Te invitaron a Pollería Santi ERP"
      - cuerpo HTML con: username, contraseña provisoria, link a {CORS_ORIGIN}/login
  And MUST retornar 201 con { id, username, email } (sin la contraseña en claro)
  And la tabla del frontend MUST refrescarse incluyendo al nuevo usuario
```

### Sad Paths

**Scenario: username duplicado**
```
Given ya existe un usuario con username "santi"
When invita con username="santi"
Then MUST retornar 400 "El nombre de usuario ya existe"
  And NOT crear el usuario ni enviar email
```

**Scenario: email duplicado**
```
Given ya existe un usuario con email "santi@x.com"
When invita
Then MUST retornar 400 "El email ya está registrado"
```

**Scenario: payload inválido**
```
Given email no pasa @IsEmail o username está vacío
Then MUST retornar 400 con detalle de validación
```

**Scenario: falla el envío de email**
```
Given el SMTP devuelve error
When MailerService.send() falla
Then MUST hacer rollback del INSERT del usuario (transacción)
  And MUST retornar 500 "No se pudo enviar la invitación. Intentá de nuevo."
  And NOT dejar al usuario creado en DB sin haber recibido el email
```

---

## UC-USR-03 — Login con contraseña provisoria

### Happy Path

**Scenario: primer login**
```
Given el usuario invitado recibió email con contraseña provisoria
When se loguea con esa contraseña en /login
Then MUST autenticarse normalmente (UC-AUTH-01)
  And el frontend MUST detectar must_change_password=true en el perfil
  And MUST mostrar banner persistente "Cambiá tu contraseña provisoria" con link a `/cambiar-password`
  And el banner NO debe bloquear la navegación (puede operar normalmente)
```

**Scenario: cambio de contraseña post-invitación**
```
Given el usuario invitado se logueó y va a /cambiar-password
When ejecuta UC-AUTH-04 exitosamente
Then MUST setear must_change_password = false en DB
  And el banner MUST desaparecer en futuros logins
```

---

## UC-USR-04 — Eliminar usuario

### Happy Path

**Scenario: eliminación exitosa**
```
Given el usuario A (autenticado) hace clic en "Eliminar" sobre la fila del usuario B
  And A.id !== B.id
  And existen al menos 2 usuarios en el sistema
When confirma el diálogo "¿Eliminar a {B.username}? Esta acción no se puede deshacer."
  And envía DELETE /api/usuarios/:id
Then MUST eliminar al usuario B de la tabla users (hard delete)
  And MUST invalidar futuros logins de B (R-AUTH-04: si tiene un JWT vigente, sigue válido hasta exp, pero re-login fallará)
  And MUST retornar 204
  And la tabla del frontend MUST refrescarse sin la fila de B
```

### Sad Paths

**Scenario: intento de auto-eliminación**
```
Given A intenta eliminar su propio user (A.id === actor.id)
When envía DELETE /api/usuarios/:id con id=A.id
Then MUST retornar 400 "No podés eliminar tu propio usuario"
  And NOT eliminar nada
```

**Scenario: último usuario del sistema**
```
Given solo queda 1 usuario en la tabla
When alguien intenta eliminarlo (caso teórico — el botón no se muestra, pero el backend valida igual)
Then MUST retornar 400 "Debe quedar al menos un usuario en el sistema"
```

**Scenario: usuario inexistente**
```
Given el id no existe
Then MUST retornar 404
```

---

## UC-USR-05 — Reenvío de invitación (opcional, fuera del MVP)

> **Estado**: NO implementado en este sprint. Documentado como referencia.

```
Given un usuario fue invitado pero perdió el email
When otro usuario hace clic en "Reenviar invitación" sobre su fila
Then MUST regenerar la contraseña provisoria (nueva)
  And MUST setear must_change_password = true
  And MUST reenviar el email
```

---

## UC-USR-06 — Auto-perfil (vista mínima)

> Opcional. Permite al usuario ver su propio username/email sin tocar la tabla.

**Scenario: ver perfil**
```
Given el usuario autenticado va a /perfil
Then MUST mostrar: username, email, fecha de alta, "Cambiar contraseña" (UC-AUTH-04)
  And email y username MUST mostrarse como solo-lectura (no editables — R-USR-03)
```

---

## Endpoints REST

| Método | Ruta | Body | Auth | Descripción |
|---|---|---|---|---|
| GET | `/api/usuarios` | — | requerida | Lista todos los usuarios |
| POST | `/api/usuarios/invite` | `{ username, email }` | requerida | Invita nuevo usuario (UC-USR-02) |
| DELETE | `/api/usuarios/:id` | — | requerida | Elimina usuario (UC-USR-04) |
| GET | `/api/usuarios/me` | — | requerida | Devuelve datos del usuario logueado |

---

## Vistas Frontend

| Ruta | Componentes |
|---|---|
| `/usuarios` | `UsuariosPage` → `UsuariosView` (tabla + `InviteUserModal`) |
| `/perfil` | `PerfilPage` → `PerfilView` (datos + link a `/cambiar-password`) |
| `/cambiar-password` | `CambiarPasswordPage` → `CambiarPasswordView` (form UC-AUTH-04) |

Hooks: `useUsuarios()` (list/invite/remove), `usePerfil()` (me + change-password).

---

## Estado de implementación
- 🔲 Entidad `User` ampliada (username, must_change_password, invited_by_user_id) + migración
- 🔲 Endpoints `/api/usuarios` (GET / POST invite / DELETE) + `/api/usuarios/me`
- 🔲 Generador de contraseña provisoria aleatoria
- 🔲 Template de email de invitación
- 🔲 Transacción para rollback si falla SMTP
- 🔲 Vista `/usuarios` con tabla y modal de invitación
- 🔲 Vista `/perfil`
- 🔲 Vista `/cambiar-password` (UC-AUTH-04)
- 🔲 Banner persistente cuando `must_change_password=true`
- 🔲 Item de menú "Usuarios" en `MainLayout`
