# Pollería Santi — Sistema de Gestión ERP

ERP web para gestión de stock, compras, ventas y caja de una pollería/carnicería.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 10 + TypeScript strict |
| Frontend | React 18 + Vite + TypeScript strict |
| Base de datos | PostgreSQL 16 |
| Deploy | Railway (3 servicios) |
| Auth | JWT con expiración fija (8h) |

---

## Prerrequisitos

- Node.js 20 (ver `.nvmrc`)
- Docker (para DB local, opcional)
- Railway CLI (solo para deploy)

---

## Arranque local

### 1. Variables de entorno

Crear `backend/.env` copiando la plantilla documentada en `docs/deploy.md`:

```
DATABASE_URL=postgresql://polleria:polleria_dev@localhost:5432/polleria_db
JWT_SECRET=<generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
PORT=3000
NODE_ENV=development
```

Crear `frontend/.env`:
```
VITE_API_URL=http://localhost:3000
```

### 2. Base de datos local (Docker)

```bash
docker compose up -d
```

### 3. Instalar dependencias

```bash
# Raíz (concurrently)
npm install

# Backend
npm install --prefix backend

# Frontend
npm install --prefix frontend
```

### 4. Migrations

```bash
cd backend && npm run migration:run
```

### 5. Levantar en modo desarrollo

```bash
npm run dev
```

- Backend: http://localhost:3000/api
- Frontend: http://localhost:5173
- Health check: http://localhost:3000/api/health

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Levanta backend y frontend en paralelo |
| `npm run typecheck` | TypeScript check en ambos workspaces |
| `npm run lint` | ESLint en ambos workspaces |
| `npm run test` | Tests en ambos workspaces |
| `npm run build:backend` | Build de producción del backend |
| `npm run build:frontend` | Build de producción del frontend |

### Backend específicos

```bash
cd backend
npm run migration:generate -- src/database/migrations/NombreMigration
npm run migration:run
npm run migration:revert
npm run test:e2e
```

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| `docs/architecture.md` | Decisiones de arquitectura con rationale |
| `docs/deploy.md` | Guía de deploy en Railway |
| `docs/conventions.md` | Convenciones de código, commits y estructura |
| `docs/specs/` | Especificaciones por módulo |
| `specs-sistema.md` | Spec funcional completa del MVP |

---

## Módulos

| Módulo | Estado | Change SDD |
|--------|--------|------------|
| Setup / Infraestructura | ✅ Completo | `setup-monorepo` |
| Auth (login) | Pendiente | `auth` |
| Productos / Stock | Pendiente | `modulo-stock` |
| Compras | Pendiente | `modulo-compras` |
| Ventas / POS | Pendiente | `modulo-ventas` |
| Caja | Pendiente | `modulo-caja` |
| Dashboard | Pendiente | `dashboard` |
