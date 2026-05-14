# Spec: Dashboard

## Descripción
Vista principal del sistema. Muestra KPIs del día en tiempo real al montar la página.
Accesible desde `/dashboard`. Requiere sesión activa.

---

## UC-DASH-01 — Ver KPIs del día

### Happy Path

**Scenario: carga exitosa con datos reales**
```
Given el usuario está autenticado
  And hay productos activos en el sistema
  And hay una caja abierta
  And hay ventas confirmadas en el día actual
When navega a /dashboard
Then MUST mostrar tarjeta "Ventas hoy" con el conteo de ventas confirmadas del día
  And MUST mostrar tarjeta "Monto ventas" con la suma de totales de ventas confirmadas del día
  And MUST mostrar tarjeta "Productos" con el total de productos con status='active'
  And MUST mostrar tarjeta "Estado caja" con valor "Abierta"
  And MUST mostrar el monto en formato $X.XXX,XX (locale es-AR)
```

**Scenario: sin ventas en el día**
```
Given el usuario está autenticado
  And la caja está abierta
  And no hay ventas registradas hoy
When navega a /dashboard
Then MUST mostrar "Ventas hoy" = 0
  And MUST mostrar "Monto ventas" = $0,00
```

### Sad Paths

**Scenario: sin caja abierta**
```
Given no hay ninguna caja con status='open'
When carga el dashboard
Then MUST mostrar "Estado caja" = "Cerrada"
  And ventas_hoy y monto_ventas_hoy MUST reflejar ventas del día igualmente
```

**Scenario: productos bajo mínimo de stock**
```
Given hay al menos 1 producto con current_stock < min_stock
When carga el dashboard
Then MUST mostrar alerta "X productos con stock bajo" encima de las tarjetas
  And el conteo MUST ser exacto (solo productos bajo mínimo, no todos)
```

**Scenario: error de conexión al backend**
```
Given el servidor no responde
When carga el dashboard
Then MUST mostrar mensaje de error al usuario
  And NOT mostrar tarjetas con datos vacíos o NaN
```

---

## UC-DASH-02 — Actualización de datos

**Scenario: datos no se actualizan automáticamente (comportamiento actual)**
```
Given el dashboard está montado
When se registra una nueva venta en otra pestaña
Then los KPIs NOT se actualizan solos (requiere navegar o recargar)
```

> **Pendiente**: auto-refresh / polling cada N segundos no implementado.

---

## Estado de implementación
- ✅ GET /api/dashboard/kpis — retorna todos los KPIs
- ✅ ventas_hoy y monto_ventas_hoy desde SalesService.findAll() filtrado por hoy
- ✅ estado_caja desde CajaService.getCurrent()
- 🔲 Auto-refresh en frontend
