# Spec: Caja

## Descripción
Gestión de caja del negocio. Apertura con monto inicial, registro de movimientos (ingresos,
egresos, retiros), cierre con conteo real y cálculo de diferencia. Historial de cajas cerradas.
Accesible desde `/caja`. Requiere sesión activa.

---

## UC-CAJA-01 — Abrir caja

### Happy Path

**Scenario: apertura exitosa**
```
Given no hay ninguna caja con status='open'
  And el usuario ingresa el monto de apertura (ej: $5000)
When confirma la apertura
Then MUST crear registro con status='open', opening_amount=5000, opened_at=now()
  And la vista MUST cambiar a estado "caja abierta"
  And MUST mostrar el monto de apertura
```

### Sad Paths

**Scenario: ya existe una caja abierta**
```
Given ya hay una caja con status='open'
When intenta abrir otra
Then MUST retornar 400 "Ya hay una caja abierta"
  And NOT crear un segundo registro
```

---

## UC-CAJA-02 — Registrar movimiento manual

### Happy Path

**Scenario: ingreso manual**
```
Given hay una caja abierta
  And el usuario registra type='income', amount=1000, description="Otros ingresos"
When confirma
Then MUST guardar el movimiento vinculado a la caja abierta
  And el efectivo esperado al cierre MUST aumentar en 1000
```

**Scenario: retiro de efectivo**
```
Given hay una caja abierta
  And el usuario registra type='withdrawal', amount=500
When confirma
Then MUST guardar el movimiento
  And el efectivo esperado MUST disminuir en 500
```

> **Nota**: Los ingresos de ventas se registran automáticamente como 'income'.
> Las anulaciones se registran automáticamente como 'expense'.
> Los retiros manuales usan type='withdrawal'.

### Sad Paths

**Scenario: sin caja abierta**
```
Given no hay caja con status='open'
When se intenta registrar un movimiento
Then MUST retornar 404 "No hay una caja abierta"
```

---

## UC-CAJA-03 — Cerrar caja

### Happy Path

**Scenario: cierre exitoso con diferencia**
```
Given hay una caja con status='open'
  And opening_amount = 5000
  And movimientos: income=3000 (ventas), withdrawal=500
  And efectivo esperado = 5000 + 3000 - 500 = 7500
  And el usuario cuenta el efectivo real y escribe 7400
When confirma el cierre
Then MUST guardar: closing_amount=7500, real_amount=7400, difference=-100
  And status MUST cambiar a 'closed', closed_at=now()
  And la vista MUST cambiar a estado "caja cerrada"
  And MUST mostrar la diferencia (-$100) con color indicativo
```

**Scenario: cierre sin diferencia**
```
Given el efectivo contado coincide con el esperado
Then difference MUST ser 0
  And MUST mostrarse como "Sin diferencia"
```

### Sad Paths

**Scenario: cerrar sin caja abierta**
```
Given no hay caja con status='open'
When se llama al endpoint de cierre
Then MUST retornar 404 "No hay una caja abierta"
```

---

## UC-CAJA-04 — Historial de cajas

### Happy Path

**Scenario: ver cajas anteriores**
```
Given existen cajas con status='closed'
When carga /caja
Then MUST mostrar lista de cajas cerradas ordenadas por fecha DESC
  And cada caja MUST mostrar: fecha apertura, fecha cierre, monto apertura, monto real, diferencia
  And diferencia positiva MUST mostrarse en verde, negativa en rojo
```

**Scenario: primera vez, sin historial**
```
Given no hay cajas cerradas
Then MUST mostrar mensaje vacío apropiado
```

---

## UC-CAJA-05 — Interacción con otros módulos

**Scenario: venta registra ingreso automático**
```
Given hay una caja abierta
When se confirma una venta de $1500
Then MUST aparecer automáticamente movimiento income=$1500 en la caja
  And el efectivo esperado al cierre MUST incluir ese ingreso
```

**Scenario: anulación registra egreso automático**
```
Given hay una caja abierta
  And se anula una venta de $800
Then MUST aparecer movimiento expense=$800 en la caja
  And el efectivo esperado al cierre MUST descontarlo
```

---

## Estado de implementación
- ✅ POST /api/caja/open — abre caja
- ✅ POST /api/caja/close — cierra con cálculo de diferencia
- ✅ GET /api/caja/current — estado actual
- ✅ GET /api/caja/history — historial de cajas cerradas
- ✅ POST /api/caja/movements — movimiento manual (desde UI)
- ✅ Movimientos automáticos desde VentasService
- 🔲 GET /api/caja/:id/movements — detalle de movimientos por caja (endpoint no implementado)
- 🔲 UI: lista de movimientos de la caja actual (solo muestra totales)
