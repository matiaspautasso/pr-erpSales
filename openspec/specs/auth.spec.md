# Spec: Auth

## Descripción
Autenticación del sistema. Login con email + password, recuperación de contraseña por email,
cambio de contraseña con sesión activa. JWT de 30 minutos. No hay refresh token.
El sistema es de **un único rol: admin**. No hay distinción de permisos entre usuarios.

Rutas frontend públicas: `/login`, `/forgot-password`, `/reset-password`.
Todas las demás rutas requieren sesión activa.

---

## Reglas globales

- **R-AUTH-01** — El JWT MUST expirar a los 30 minutos de emitido (`JWT_EXPIRES_IN=30m`).
- **R-AUTH-02** — No existen refresh tokens. Al expirar, el usuario MUST loguearse de nuevo.
- **R-AUTH-03** — No existe logout server-side. El cliente descarta el token; el servidor no mantiene blacklist.
- **R-AUTH-04** — Toda contraseña almacenada MUST estar hasheada con bcrypt (rounds ≥ 10).
- **R-AUTH-05** — Toda contraseña ingresada por el usuario MUST tener mínimo 8 caracteres.
- **R-AUTH-06** — Los endpoints `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password` MUST ser `@Public()`.
- **R-AUTH-07** — Todos los demás endpoints MUST estar protegidos por `JwtAuthGuard` global.

---

## UC-AUTH-01 — Login

### Happy Path

**Scenario: login exitoso**
```
Given existe un usuario con email "x@y.com" y password "secret123" (status='active')
When envía POST /api/auth/login { email: "x@y.com", password: "secret123" }
Then MUST retornar 200 con { access_token: <jwt> }
  And el JWT MUST contener { sub: user.id, email: user.email, iat, exp }
  And exp - iat MUST ser 30 minutos
  And el frontend MUST persistir el token en localStorage (key 'polleria_token')
  And MUST redirigir a /dashboard
```

### Sad Paths

**Scenario: email inexistente**
```
Given no existe usuario con ese email
When envía POST /api/auth/login con ese email
Then MUST retornar 401 con mensaje genérico "Email o contraseña incorrectos"
  And NOT revelar si el email existe o no
```

**Scenario: password incorrecta**
```
Given existe el usuario pero la password no coincide
When envía login
Then MUST retornar 401 con el mismo mensaje genérico
```

**Scenario: usuario eliminado (R-USR-04)**
```
Given el usuario fue eliminado por un admin
When intenta loguearse
Then MUST retornar 401 con "Email o contraseña incorrectos"
  And NOT revelar que el usuario fue eliminado
```

**Scenario: payload inválido**
```
Given email no es válido o password tiene < 8 caracteres
When envía login
Then MUST retornar 400 con detalle de validación de DTO
```

---

## UC-AUTH-02 — Recuperar contraseña (forgot)

### Happy Path

**Scenario: solicitud aceptada**
```
Given el usuario hace POST /api/auth/forgot-password { email: "x@y.com" }
When el email pertenece a un usuario activo
Then MUST generar un token hexadecimal de 64 chars
  And MUST persistirlo en password_reset_tokens con expires_at = now + 1h, used_at = null
  And MUST enviar email con enlace {CORS_ORIGIN}/reset-password?token={token}
  And MUST retornar 200 con mensaje genérico "Si el email está registrado, recibirás instrucciones"
```

### Sad Paths

**Scenario: email no registrado**
```
Given el email no existe en la tabla users
When envía forgot-password
Then MUST retornar 200 con el mismo mensaje genérico
  And NOT enviar ningún email
  And NOT crear ningún token
```

**Scenario: email inválido (formato)**
```
Given el email no pasa @IsEmail
Then MUST retornar 400 con validación de DTO
```

---

## UC-AUTH-03 — Resetear contraseña con token

### Happy Path

**Scenario: reset exitoso**
```
Given existe un token válido (expires_at > now AND used_at IS NULL)
When envía POST /api/auth/reset-password { token, new_password: "secret999" }
Then MUST actualizar password_hash del usuario asociado (bcrypt rounds ≥ 10)
  And MUST marcar el token como usado (used_at = now)
  And MUST retornar 200
  And el frontend MUST redirigir a /login a los 2 segundos
```

### Sad Paths

**Scenario: token expirado**
```
Given el token tiene expires_at < now
When envía reset
Then MUST retornar 400 "El enlace es inválido o ya expiró"
  And NOT modificar la contraseña
```

**Scenario: token ya usado**
```
Given el token tiene used_at IS NOT NULL
When envía reset
Then MUST retornar 400 "El enlace es inválido o ya expiró"
```

**Scenario: token inexistente**
```
Given el token no aparece en la tabla
Then MUST retornar 400 con el mismo mensaje genérico
```

**Scenario: new_password < 8 caracteres**
```
Given new_password tiene 7 caracteres o menos
Then MUST retornar 400 con detalle de validación (front Y back lo enforce)
```

---

## UC-AUTH-04 — Cambiar contraseña con sesión activa

> **Novedad de esta spec.** No existía antes.

### Happy Path

**Scenario: cambio exitoso**
```
Given el usuario está autenticado (JWT válido)
  And envía POST /api/auth/change-password { current_password, new_password }
  And current_password coincide con el hash en DB
  And new_password tiene >= 8 caracteres
  And new_password !== current_password
When el backend procesa la solicitud
Then MUST actualizar password_hash con bcrypt
  And MUST retornar 200
  And el JWT actual MUST seguir siendo válido hasta su expiración natural (no se revoca)
```

### Sad Paths

**Scenario: current_password no coincide**
```
Given current_password es incorrecta
Then MUST retornar 401 "La contraseña actual es incorrecta"
  And NOT modificar el hash
```

**Scenario: new_password igual a la actual**
```
Given new_password === current_password
Then MUST retornar 400 "La nueva contraseña debe ser distinta de la actual"
```

**Scenario: new_password < 8 caracteres**
```
Then MUST retornar 400 con detalle de validación
```

**Scenario: sin JWT**
```
Given no hay header Authorization
Then MUST retornar 401 (guard global)
```

---

## UC-AUTH-05 — Logout (client-side)

### Happy Path

**Scenario: logout**
```
Given el usuario hace clic en "Cerrar sesión"
When se ejecuta logout()
Then MUST borrar localStorage['polleria_token']
  And MUST setear user = null en AuthContext
  And MUST redirigir a /login

Note: no se invoca endpoint backend. El JWT sigue siendo válido en el servidor hasta su exp natural.
```

**Scenario: warning de caja abierta al cerrar sesión**
```
Given el usuario hace clic en "Cerrar sesión"
  And existe una caja con status='open'
Then MUST mostrar modal de aviso "Hay una caja abierta. ¿Cerrar igualmente?"
  And el modal MUST ser NO bloqueante (el usuario puede confirmar y salir)
  And el modal MUST ofrecer "Ir a Caja" como acción primaria
```

---

## UC-AUTH-06 — Expiración de token

### Happy Path

**Scenario: token expirado en request**
```
Given el JWT tiene exp < now
When el cliente envía cualquier request a un endpoint protegido
Then el servidor MUST retornar 401
  And el http interceptor MUST borrar el token de localStorage
  And MUST redirigir a /login
```

**Scenario: token expirado detectado al cargar la app**
```
Given al cargar la app, AuthContext parsea el JWT del localStorage
  And el exp del JWT < now
Then MUST descartar el token (user = null, isAuthenticated = false)
  And ProtectedRoute MUST redirigir a /login
```

---

## Configuración de entorno

| Variable | Valor | Notas |
|---|---|---|
| `JWT_SECRET` | string min 32 chars | requerido |
| `JWT_EXPIRES_IN` | `30m` | **cambio respecto al MVP (era 8h)** |
| `CORS_ORIGIN` | URL del front | usado en el link del email de reset |
| `GOOGLE_SMTP_USER` | email | requerido para mailer |
| `GOOGLE_SMTP_APP_PASSWORD` | string | requerido para mailer |

---

## Estado de implementación
- ✅ POST /api/auth/login
- ✅ POST /api/auth/forgot-password
- ✅ POST /api/auth/reset-password
- 🔲 POST /api/auth/change-password (UC-AUTH-04 nuevo)
- 🔲 Bajar JWT_EXPIRES_IN de 8h → 30m
- 🔲 Validación `@MinLength(8)` también en login (hoy solo @IsString)
- 🔲 Warning modal de caja abierta al logout
- 🔲 Hashear el `password_reset_tokens.token` antes de persistir (hoy se guarda en claro)
