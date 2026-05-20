# Pendientes — Pollería Santi ERP

Lista accionable derivada del análisis de brechas specs vs código (2026-05-19).
Estado por módulo en [`README.md`](README.md#módulos).

**Prioridad 1, 2 y 3 resueltas el 2026-05-19** con TDD estricto. Verificación
independiente final: backend 80 tests PASS / typecheck OK, frontend 52 tests
PASS / typecheck OK, sin regresiones.

> ⚠️ Pendiente operativo: ejecutar `npm run migration:run` antes de desplegar.
> Migraciones sin correr:
> - `1747094400010-AddPaymentMethodToSales.ts`
> - `1747094400011-AddCuitAndObservacionesToProveedores.ts`
> - `1747094400030-AddDiscountToSales.ts`

---

## Prioridad 1 — Bloquean funcionalidad de negocio ✅ HECHO

- [x] **Ventas: medio de pago** — `payment_method` (`cash|transfer|debit|credit`, etiquetas español en POS) en `create-sale.dto.ts` (`@IsIn`), `sale.entity.ts`, `sales.service.ts`, `usePOS.ts`, `POSView.tsx` + migración.
- [x] **Caja: historial de cajas cerradas** — `CajaView.tsx`/`CajaPage.tsx` refactor container/presentational; renderiza historial vía `fetchHistory()` existente.
- [x] **Caja: egresos/retiros manuales** — `MovementForm` en `CajaView.tsx` + `registerMovement()` en `useCaja.ts` → `POST /api/caja/movements` con `type` `expense`/`withdrawal`.
- [x] **Productos: editar y desactivar en UI** — `EditProductModal` + acción Desactivar (`status:'inactive'`, con confirm) + `update()` en `useProducts.ts`. También columna Costo (UC-PROD-01).

## Prioridad 2 — Bugs / errores de datos ✅ HECHO

- [x] **Límite de 50 productos cuenta inactivos** — `products.service.ts` ahora `count({ where: { status: 'active' } })`.
- [x] **`SaleItem.subtotal` nunca se persiste** — `sales.service.ts` arma los items con `subtotal = quantity * unit_price`.
- [x] **Dashboard carga todas las ventas en memoria** — nuevo `SalesService.findConfirmedSince(date)` (QueryBuilder, `status=confirmed AND created_at>=since`); `dashboard.service.ts` lo usa, sin filtrado en JS.
- [x] **Cierre de caja rechaza monto real = 0** — `CloseCajaDto` ahora `@Min(0)`.
- [x] **Stock con 2 decimales en UI** — `ProductsView.tsx` ahora `toFixed(3)`.

## Prioridad 3 — Features del MVP incompletos ✅ HECHO (2026-05-19)

- [x] **Proveedor sin CUIT ni observaciones** — `proveedor.entity.ts` (`cuit` NOT NULL default '', `observaciones` nullable) + `create-proveedor.dto.ts` + migración `1747094400011`.
- [x] **ABM de proveedores** — `ProveedoresService.update/remove/findComprasByProveedor`; endpoints `PATCH/DELETE /api/proveedores/:id` y `GET /api/proveedores/:id/compras`; feature frontend `proveedores/` (Page/View/hook) + ruta `/proveedores` + nav.
- [x] **Caja: movimientos de la sesión activa** — `CajaService.getCurrentMovements()` + `GET /api/caja/current/movements`; UI lista movimientos + saldo esperado en tiempo real.
- [x] **Ventas: descuento porcentual opcional** — `discount_percent` (`@IsOptional @Min(0) @Max(100)`) en DTO/entidad; total = `subtotalsSum * (1 - d/100)` redondeado; input en POS; migración `1747094400030`.
- [x] **Dashboard: `productos_bajo_minimo` incluye inactivos** — resuelto junto con el fix de dashboard (P2): `productRepo.find` filtra `status='active'`.
- [x] **Caja: resumen por medio de pago** — `CajaService.getCloseSummary()` deriva el desglose de ventas confirmadas desde apertura vía `SalesService.findConfirmedSince` (solo lectura); `GET /api/caja/current/summary`; UI muestra Efectivo/Transferencia/Débito/Crédito en el cierre.

> ⚠️ Deuda arquitectónica introducida: dependencia circular `VentasModule ↔ CajaModule`
> resuelta con `forwardRef`. Funciona y typecheck pasa, pero conviene revisar si el
> resumen debería vivir en un servicio de reportes para romper el ciclo.

## Prioridad 4 — Deuda técnica / cobertura

- [ ] Crear `openspec/specs/auth.spec.md` con scenarios BDD (auth solo está en `specs-sistema.md`).
- [ ] Test de `SalesService.cancel()` en `sales.service.spec.ts` (sin cobertura).
- [ ] Validar `new_password` mínimo 8 caracteres en `ResetPasswordDto` (el front lo exige, el back no).

---

## Discrepancias spec vs código

Todas las discrepancias detectadas en el gap analysis del 2026-05-19 fueron
resueltas (P1/P2/P3). No quedan discrepancias spec vs código abiertas.

Resueltas el 2026-05-19 (P1/P2): límite 50 solo activos, medio de pago
obligatorio, stock 3 decimales, historial de cajas visible, cierre de caja
acepta 0, alerta stock bajo solo activos, `SaleItem.subtotal` persistido.
