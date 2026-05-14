# Spec: Compras

## Descripción
Registro de compras a proveedores. Cada compra actualiza automáticamente el stock del producto.
Permite crear proveedores nuevos inline. Accesible desde `/compras`. Requiere sesión activa.

---

## UC-COMP-01 — Listar compras

### Happy Path

**Scenario: historial de compras**
```
Given existen compras registradas
When el usuario navega a /compras
Then MUST mostrar tabla con: fecha, proveedor, producto, cantidad, costo unitario, total
  And la cantidad MUST mostrarse con 3 decimales
  And el total MUST mostrarse formateado en pesos (es-AR)
  And MUST mostrar botón "Nueva compra"
```

**Scenario: sin compras**
```
Given no hay compras registradas
When navega a /compras
Then MUST mostrar mensaje vacío apropiado
```

---

## UC-COMP-02 — Registrar compra con proveedor existente

### Happy Path

**Scenario: compra exitosa**
```
Given existe un proveedor en el sistema
  And existe un producto en el sistema
  And el usuario completa: proveedor, producto, cantidad > 0, costo unitario, fecha
When confirma la compra
Then MUST guardar la compra con total = cantidad * costo_unitario
  And MUST registrar movimiento de stock ENTRADA para el producto
  And MUST aparecer en la tabla inmediatamente
  And el stock del producto MUST aumentar en la cantidad comprada
```

---

## UC-COMP-03 — Registrar compra con proveedor nuevo (inline)

### Happy Path

**Scenario: crear proveedor en el mismo flujo**
```
Given el usuario hace clic en "+ Nuevo" dentro del modal de compra
  And escribe el nombre del proveedor y confirma
When el proveedor es creado exitosamente
Then MUST pre-seleccionar el nuevo proveedor en el selector
  And el usuario MUST poder continuar completando la compra sin salir del modal
```

---

## UC-COMP-04 — Validaciones

### Sad Paths

**Scenario: proveedor inexistente**
```
Given se envía un proveedor_id que no existe en DB
When se procesa la compra
Then MUST retornar 404 NotFoundException
  And el stock NO DEBE modificarse
```

**Scenario: cantidad cero o negativa**
```
Given el usuario ingresa quantity = 0
When confirma la compra
Then MUST retornar 400 BadRequestException
  And el stock NO DEBE modificarse
```

**Scenario: producto inexistente**
```
Given el producto_id no existe
When se procesa la compra
Then el StockService MUST retornar 404
  And la compra NO DEBE guardarse
```

**Scenario: campos faltantes**
```
Given el usuario no selecciona proveedor o producto
When intenta confirmar
Then el frontend MUST mostrar error "Seleccioná proveedor y producto"
  And NOT enviar el request al backend
```

---

## UC-COMP-05 — Proveedores

> **Pendiente**: no existe vista dedicada de proveedores.

**Scenario: crear proveedor**
```
Given se envía POST /api/proveedores con { name }
Then MUST crear el proveedor con phone=null, email=null por defecto
```

**Scenario: listar proveedores**
```
Given existen proveedores
When GET /api/proveedores
Then MUST retornar lista completa
```

---

## Estado de implementación
- ✅ GET /api/compras — historial
- ✅ POST /api/compras — registra + actualiza stock
- ✅ GET /api/proveedores — lista
- ✅ POST /api/proveedores — crea
- 🔲 Vista dedicada de proveedores (CRUD completo)
- 🔲 Paginación en historial de compras
