# Arquitectura del Sistema — Pollería Santi ERP

## Visión general

```
browser
  └── React 18 + Vite (frontend/)
        │  axios + JWT interceptors
        ▼
  NestJS 10 (backend/)
        │  TypeORM
        ▼
  PostgreSQL 16
```

Tres servicios independientes en Railway. Comunicación via HTTP REST. Auth via JWT Bearer token.

---

## Decisiones de arquitectura

### AD-01: Monorepo sin herramienta dedicada

**Elegido:** Dos directorios independientes (`backend/`, `frontend/`) con `package.json` propio, coordinados por scripts raíz con `concurrently`.

**Alternativas rechazadas:** Nx, Turborepo, pnpm workspaces.

**Rationale:** Sistema de un local, un desarrollador, dos servicios. La complejidad de herramientas monorepo no se justifica. Si en el futuro hay código compartido entre back y front (ej. tipos), migramos a pnpm workspaces como evolución natural — sin cambio estructural mayor.

---

### AD-02: TypeORM con `synchronize: false` siempre

**Elegido:** Migrations versionadas en `src/database/migrations/`. `synchronize: false` en todos los entornos, incluyendo development.

**Alternativas rechazadas:** `synchronize: true` en development (Prisma considerado y descartado por integración más débil con NestJS y duplicación de tipos).

**Rationale:** `synchronize: true` en dev crea divergencia con prod. Una sola vez que una migración falla en prod por diferencias dev/prod justifica la disciplina. Las migrations se versionan en git y se ejecutan automáticamente en Railway como release command.

**Consecuencia:** Todo cambio de schema requiere generar una migration. Flujo: `npm run migration:generate`, revisar, commitear, pushear → Railway ejecuta `migration:run` antes de reiniciar el servidor.

---

### AD-03: JWT global guard con default-deny

**Elegido:** `JwtAuthGuard` registrado como `APP_GUARD` global. Todas las rutas están protegidas por defecto. Las rutas públicas usan el decorador `@Public()`.

**Alternativas rechazadas:** Guard por controlador (verbose, propenso a olvidar), sin guard global (inseguro por defecto).

**Rationale:** Default-deny es más seguro. Agregar `@Public()` es explícito y visible en el código. Si se agrega un endpoint y se olvida protegerlo, falla con 401 — el error es evidente.

---

### AD-04: JWT en localStorage con interceptores axios

**Elegido:** Token almacenado bajo clave `polleria_token` en `localStorage`. Axios con interceptor de request (inyecta `Authorization: Bearer`) e interceptor de response (captura 401 → limpia token → redirige a `/login`). `AuthContext` encapsula toda la lógica.

**Alternativas rechazadas:** Cookies httpOnly (requieren configuración CSRF + cross-domain en Railway, complejidad injustificada para uso interno).

**Rationale:** Sistema de uso interno con un único usuario administrador. No existe vector XSS relevante (sin user-generated content renderizado como HTML). La simplicidad operativa pesa más que la pureza de seguridad en este contexto.

**Supuestos documentados:** Esta decisión asume entorno controlado y usuario único. Si el sistema se expone públicamente o se agregan más usuarios, revisar migración a cookies httpOnly — el `AuthContext` encapsula el storage, por lo que el cambio es una sola modificación.

---

### AD-05: Estructura feature-first en el frontend

**Elegido:** `app/` (composición global), `features/` (lógica de negocio por feature), `shared/` (reutilizables). Dentro de cada feature: container (`XxxPage.tsx`) + presentational (`XxxView.tsx`) + hook (`useXxx.ts`).

**Alternativas rechazadas:** Por tipo (`components/`, `pages/`, `hooks/`), Atomic Design.

**Rationale:** El sistema crece por features (stock, ventas, caja). Ubicar todo lo de una feature junto reduce el costo de navegar, modificar y eventualmente eliminar una feature completa.

---

### AD-06: Validación de entorno con Zod al arranque

**Elegido:** `validateEnv()` en `ConfigModule.forRoot({ validate })`. Si falta una variable obligatoria, el proceso termina con mensaje descriptivo antes de cualquier conexión.

**Alternativas rechazadas:** Joi, class-validator, sin validación.

**Rationale:** Zod tiene inference TypeScript nativa (el tipo `Env` se deriva del schema). El error al arranque es mucho más barato que el error en runtime cuando se accede a una variable faltante.

---

### AD-07: Railway con Nixpacks y Root Directory por servicio

**Elegido:** Nixpacks (autodetección) con Root Directory `backend/` y `frontend/` en cada servicio Railway. Release command en backend: `npm run migration:run`.

**Alternativas rechazadas:** Dockerfile custom (más mantenimiento), un único servicio fullstack (acopla ciclos de deploy).

**Rationale:** Servicios separados permiten rebuild independiente de back y front. Nixpacks detecta Node automáticamente. El release command garantiza que las migrations se aplican antes de que el nuevo código entre en servicio.

---

## Flujo de request autenticado

```
Usuario
  └─ React Page
       └─ axios (shared/api/http.ts)
            [interceptor request: agrega Authorization: Bearer {token}]
            └─ NestJS JwtAuthGuard (global)
                 [valida JWT → extrae payload → inyecta en req.user]
                 └─ Controller → Service → Repository → PostgreSQL
                      └─ HttpExceptionFilter (formato uniforme { statusCode, message })
                           └─ Response → axios → React Page
```

## Flujo de sesión expirada

```
Backend → 401
  └─ axios interceptor response
       └─ localStorage.removeItem('polleria_token')
            └─ window.location.href = '/login'
```
