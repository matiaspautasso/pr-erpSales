# Spec: Ventas / POS

## Descripción
Punto de venta (POS). Permite armar un carrito, confirmar la venta, y ver el historial del día.
Cada venta valida caja abierta y stock disponible. Descuenta stock y registra ingreso en caja.
Accesible desde `/ventas`. Requiere sesión activa.

---

## UC-VTA-01 — Armar carrito

### Happy Path

**Scenario: agregar producto al carrito**
```
Given existen productos activos con stock > 0
  And el usuario selecciona un producto del selector
When hace clic en "Agregar"
Then MUST aparecer el producto en el carrito con:
    - cantidad inicial: 0.5 kg (si unit_of_sale='kg') o 1 (si unit_of_sale='unit')
    - precio unitario igual al precio del producto
    - subtotal = cantidad × precio
```

**Scenario: agregar el mismo producto dos veces**
```
Given el producto ya está en el carrito
When el usuario lo vuelve a agregar
Then MUST incrementar la cantidad (no duplicar la fila)
```

**Scenario: modificar cantidad en el carrito**
```
Given un producto está en el carrito
When el usuario cambia el campo de cantidad
Then MUST recalcular el subtotal de esa fila
  And MUST recalcular el total del carrito
```

**Scenario: quitar producto del carrito**
```
Given un producto está en el carrito
When hace clic en ✕
Then MUST eliminar esa fila
  And MUST recalcular el total
```

**Scenario: cantidad = 0 al editar**
```
Given el usuario edita la cantidad a 0
Then MUST eliminar automáticamente el item del carrito
```

---

## UC-VTA-02 — Confirmar venta

### Happy Path

**Scenario: venta exitosa**
```
Given hay una caja abierta
  And todos los productos del carrito tienen stock >= cantidad solicitada
  And el carrito tiene al menos 1 item
When el usuario hace clic en "Confirmar venta"
Then MUST crear la venta con status='confirmed' y total correcto
  And MUST registrar movimiento SALIDA en stock por cada item
  And MUST registrar movimiento 'income' en caja por el total de la venta
  And MUST limpiar el carrito
  And MUST aparecer la venta en el panel de historial derecho
```

**Scenario: multi-item**
```
Given el carrito tiene 3 productos distintos
When confirma
Then MUST descontar stock de los 3 productos
  And el total de la venta MUST ser la suma de todos los subtotales
  And MUST registrar UN solo movimiento de ingreso en caja (el total)
```

### Sad Paths

**Scenario: sin caja abierta**
```
Given no hay ninguna caja con status='open'
When el usuario confirma la venta
Then el backend MUST retornar 400
  And MUST mostrar mensaje "No hay una caja abierta para registrar la venta"
  And el carrito MUST mantenerse intacto
  And el stock NO DEBE modificarse
```

**Scenario: stock insuficiente en algún item**
```
Given el producto X tiene current_stock = 1.000
  And el carrito tiene X con cantidad = 5
When confirma la venta
Then MUST retornar 400
  And MUST mostrar mensaje indicando el producto con stock insuficiente
  And la venta NO DEBE guardarse
  And el stock del resto de productos NO DEBE modificarse
```

**Scenario: carrito vacío**
```
Given el carrito no tiene items
Then el botón "Confirmar venta" MUST estar deshabilitado
  And NOT enviar ningún request
```

---

## UC-VTA-03 — Historial de ventas del día

### Happy Path

**Scenario: ver ventas recientes**
```
Given hay ventas registradas
When carga el POS
Then MUST mostrar en el panel derecho las últimas 20 ventas
  And cada venta MUST mostrar: número, hora, total
  And las ventas canceladas MUST mostrarse con opacidad reducida y etiqueta "anulada"
```

---

## UC-VTA-04 — Anular venta

> **Estado**: endpoint backend implementado (POST /api/ventas/:id/cancel), UI pendiente.

### Happy Path

**Scenario: anulación exitosa**
```
Given la venta tiene status='confirmed'
When se llama POST /api/ventas/:id/cancel
Then MUST cambiar status a 'cancelled'
  And MUST registrar movimiento ANULACION_VENTA en stock (reintegra stock)
  And MUST registrar movimiento 'expense' en caja por el total de la venta
```

### Sad Paths

**Scenario: anular venta ya cancelada**
```
Given la venta ya tiene status='cancelled'
When se llama cancel
Then MUST retornar 400 "La venta X ya está cancelada"
```

**Scenario: venta inexistente**
```
Given el id no existe
When se llama cancel
Then MUST retornar 400
```

---

## Estado de implementación
- ✅ POST /api/ventas — crea venta con validaciones
- ✅ GET /api/ventas — lista todas
- ✅ POST /api/ventas/:id/cancel — anula (backend)
- ✅ UI: carrito + confirmación + historial
- ✅ Botón "Anular" en UI del POS (con confirmación window.confirm)
- 🔲 Paginación en historial
- 🔲 Filtro por fecha en historial
