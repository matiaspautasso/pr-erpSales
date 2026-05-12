# Convenciones del Proyecto

## Commits

Formato: **Conventional Commits**

```
<tipo>(<scope>): <descripción>

Tipos: feat | fix | docs | refactor | test | chore | perf
Scope: backend | frontend | db | auth | stock | ventas | caja | compras | deps
```

Ejemplos:
```
feat(backend): add JWT auth guard with @Public decorator
fix(frontend): clear expired token on AuthContext init
docs(deploy): add troubleshooting for migration failures
test(backend): add e2e spec for GET /api/health
chore(deps): update typeorm to 0.3.20
```

**Reglas:**
- En inglés
- Descripción en imperativo ("add", "fix", "update" — no "added", "fixed")
- Sin punto al final
- Sin "Co-Authored-By" ni atribuciones de AI

---

## Naming — Backend (NestJS)

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Archivos | kebab-case | `jwt-auth.guard.ts` |
| Clases | PascalCase | `JwtAuthGuard` |
| Interfaces | PascalCase | `JwtPayload` |
| Variables/funciones | camelCase | `validateEnv` |
| Constantes | SCREAMING_SNAKE | `IS_PUBLIC_KEY` |
| Módulos NestJS | Un módulo por dominio | `AuthModule`, `StockModule` |
| Entidades TypeORM | Singular PascalCase + `.entity.ts` | `product.entity.ts` → `Product` |
| DTOs | Verbo + Nombre + Dto | `CreateProductDto`, `UpdateSaleDto` |
| Migrations | Timestamp + PascalCase | `1715000000000-CreateUsersTable` |

---

## Naming — Frontend (React)

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Archivos componentes | PascalCase + `.tsx` | `HealthView.tsx` |
| Archivos hooks | camelCase + `.ts` | `useHealthCheck.ts` |
| Archivos utils/api | camelCase + `.ts` | `http.ts` |
| Componentes | PascalCase | `HealthView` |
| Hooks | `use` + PascalCase | `useHealthCheck` |
| Props interfaces | `Props` (dentro del archivo) | `interface Props { ... }` |

---

## Estructura de features (frontend)

Cada feature en `src/features/<nombre>/`:

```
features/
└── health/
    ├── HealthPage.tsx      ← Container: lógica + datos
    ├── HealthView.tsx      ← Presentational: solo UI, sin lógica de negocio
    └── useHealthCheck.ts   ← Hook: side effects, estado derivado
```

**Regla:** Los componentes `View` no importan hooks de negocio ni `http.ts`. Solo reciben props.

---

## Estructura de módulos (backend)

Cada módulo en `src/modules/<nombre>/`:

```
modules/
└── stock/
    ├── stock.module.ts
    ├── stock.controller.ts
    ├── stock.service.ts
    ├── dto/
    │   ├── create-product.dto.ts
    │   └── update-product.dto.ts
    └── entities/
        └── product.entity.ts
```

---

## TypeScript

- `strict: true` siempre. No bajar ninguna flag de strictness.
- No `any`. Usar `unknown` + type guards.
- Preferir `interface` sobre `type` para shapes de objetos.
- En entidades TypeORM: usar `!:` (non-null assertion) en propiedades que TypeORM garantiza, no bajar strictness.
- No `as` (type casting) salvo casos muy justificados y documentados con comentario.

---

## Testing

- Los tests de unidad van junto al archivo que testean (`foo.spec.ts` al lado de `foo.ts`).
- Los tests e2e van en `backend/test/` con sufijo `.e2e-spec.ts`.
- Naming de tests: `describe('ComponentName')` → `it('hace X cuando Y')`.
- En español los nombres de tests — son parte de la documentación del comportamiento.
- TDD estricto: escribir el test antes que el código de producción.

---

## Git branches

```
main          ← producción, siempre deployable
feat/<nombre> ← features (una por change SDD)
fix/<nombre>  ← bug fixes
```

Ejemplos: `feat/setup-monorepo`, `feat/modulo-stock`, `fix/health-check-503`.

---

## Variables de entorno

- Nunca hardcodear valores en código.
- Siempre validar con Zod en el backend al arranque.
- Frontend: solo variables `VITE_*`.
- Documentar cada variable en `docs/deploy.md`.
