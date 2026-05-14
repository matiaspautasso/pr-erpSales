# Skill Registry — Pollería Santi ERP

## Project Context
- **Stack**: NestJS 10 + TypeScript (backend), React 18 + Vite + TypeScript (frontend), PostgreSQL, Railway
- **Root**: `prPolleriaSanti/erpPolleria/`
- **Persistence**: engram (`polleria-santi`)
- **Strict TDD Mode**: enabled

## User Skills

| Skill | Trigger |
|-------|---------|
| uxui | UX/UI design critique, component generation, design system, wireframes, accessibility |
| frontend-design | Build web components, pages, or applications with high design quality |
| use-railway | Railway infrastructure: projects, services, DB, deploy, domains, env vars |
| sdd-explore | Investigate ideas, read codebase, compare approaches |
| sdd-propose | Create change proposal |
| sdd-spec | Write specs with Given/When/Then |
| sdd-design | Technical design document |
| sdd-tasks | Break down into implementation tasks |
| sdd-apply | Implement tasks |
| sdd-verify | Validate implementation vs specs |
| sdd-archive | Close change, persist final state |

## Compact Rules

### TypeScript
- `strict: true` siempre. No `any` — usar `unknown` + type guards
- Preferir `interface` sobre `type` para shapes de objetos
- No `as` salvo casos justificados con comentario

### NestJS (backend)
- Módulo por dominio: auth, productos, ventas, compras, caja, dashboard
- Repository pattern via TypeORM (`synchronize: false` siempre, migrations versionadas)
- DTOs con class-validator en todos los inputs
- JWT guard global (default-deny) + `@Public()` para rutas abiertas
- Naming: `kebab-case` archivos, `PascalCase` clases, `CreateXxxDto` / `UpdateXxxDto`

### React (frontend)
- React 18 + Vite 5 + TypeScript strict
- React Router v6
- Patrón: `XxxPage.tsx` (container) + `XxxView.tsx` (presentational) + `useXxx.ts` (hook)
- No importar hooks de negocio ni `http.ts` desde componentes View
- Tailwind CSS — sin inline styles

### Dominio — Reglas clave
- Productos tienen `unidad_de_venta: 'kg' | 'unidad'`
- Stock: decimal para kg, entero para unidades
- Precio no modificable al momento de la venta
- Sin integración AFIP, Mercado Pago, balanza ni dispositivos externos
- Medios de pago digitales son registros manuales (no procesados por el sistema)
- Recupero de contraseña vía Google SMTP (Nodemailer + App Password)

### Design System
- Fondo: `#EAF4FF` | Primario: `#2563EB` | Título: `#1E3A8A`
- Fuentes: Sora (títulos) + Lexend (cuerpo)
- Estados: éxito `#16A34A`, error `#DC2626`, advertencia `#F59E0B`
- Tablas: normal `#FFFFFF`, alterna `#F9FAFB`, hover `#E0ECFF`

### Testing
- **Strict TDD**: escribir test antes que código de producción
- Backend: Jest 29 — `npm test` (unit) | `npm run test:e2e` (supertest)
- Frontend: Vitest 1.1 + @testing-library/react — `npm test`
- Unit al lado del código (`foo.spec.ts` junto a `foo.ts`)
- E2E backend en `backend/test/*.e2e-spec.ts`
- Nombres en español: `it('lanza error cuando stock es insuficiente')`
- No mockear DB en tests de integración

### Commits
- Conventional Commits en inglés, imperativo, sin punto final
- Scopes: `backend | frontend | db | auth | stock | ventas | caja | compras | deps`
- Sin "Co-Authored-By" ni atribuciones de AI
