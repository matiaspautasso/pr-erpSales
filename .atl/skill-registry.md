# Skill Registry — Pollería Santi ERP

## Project Context
- **Stack**: NestJS + TypeScript (backend), React + TypeScript (frontend), PostgreSQL, Railway
- **Root**: prPolleriaSanti/erpPolleria/

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
- Strict mode always on
- No `any` — use `unknown` + type guards
- Prefer interfaces over types for object shapes

### NestJS (backend)
- Module per domain (auth, productos, compras, ventas, caja)
- Repository pattern via TypeORM
- DTOs with class-validator for all inputs
- Guards for auth, no inline JWT checks

### React (frontend)
- Vite + React 18 + TypeScript strict
- React Router v6 for navigation
- Container/presentational pattern
- No inline styles — Tailwind or CSS modules

### Design System
- Paleta: fondo #EAF4FF, primario #2563EB, título #1E3A8A
- Fuentes: Sora (títulos) + Lexend (cuerpo)
- Estados: éxito #16A34A, error #DC2626, advertencia #F59E0B
- Tablas: fila normal #FFFFFF, alterna #F9FAFB, hover #E0ECFF

### Testing
- TDD estricto cuando el runner esté disponible
- Unit: lógica de dominio (cálculos stock, caja)
- Integration: endpoints NestJS con DB real
- E2E: flujos críticos (POS, cierre caja)
