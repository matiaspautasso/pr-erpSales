# Spec: Productos

## Descripción
ABM de productos del negocio. Gestión de stock manual (ajustes). Máximo 50 productos activos.
Accesible desde `/productos`. Requiere sesión activa.

---

## UC-PROD-01 — Listar productos

### Happy Path

**Scenario: listado normal**
```
Given existen productos en el sistema
When el usuario navega a /productos
Then MUST mostrar tabla con columnas: nombre, categoría, unidad, precio, costo, stock actual, stock mínimo, estado
  And cada fila MUST mostrar el stock con 3 decimales
  And MUST mostrar botón "Nuevo producto" en el header
  And MUST mostrar botón "Ajustar stock" por fila
```

**Scenario: sin productos**
```
Given no hay ningún producto registrado
When navega a /productos
Then MUST mostrar mensaje "No hay productos registrados"
  And MUST mostrar botón "Nuevo producto" igualmente
```

---

## UC-PROD-02 — Crear producto

### Happy Path

**Scenario: creación exitosa**
```
Given el total de productos activos es < 50
  And el usuario completa: nombre, categoría, unidad_de_venta, precio, costo, stock_mínimo
When confirma el formulario
Then MUST crear el producto con status='active' y current_stock=0
  And MUST aparecer en la tabla inmediatamente
  And el modal MUST cerrarse
```

**Scenario: unidad de venta**
```
Given el usuario selecciona unit_of_sale='kg'
Then el campo cantidad en ventas/compras MUST permitir decimales (step=0.001)

Given el usuario selecciona unit_of_sale='unit'
Then el campo cantidad MUST usar step=1
```

### Sad Paths

**Scenario: límite de 50 productos**
```
Given ya existen 50 productos activos
When intenta crear un producto #51
Then el backend MUST retornar 400 BadRequest
  And MUST mostrar mensaje "El sistema no permite más de 50 productos"
```

**Scenario: campos requeridos faltantes**
```
Given el usuario no completa algún campo requerido
When intenta confirmar
Then el formulario MUST no enviarse (validación HTML5 o class-validator)
```

---

## UC-PROD-03 — Ajustar stock

### Happy Path

**Scenario: ajuste positivo (entrada por corrección)**
```
Given el producto existe
  And el usuario selecciona tipo=AJUSTE_POSITIVO, cantidad=5, motivo="Error de carga"
When confirma
Then MUST aumentar current_stock en 5
  And MUST registrar movimiento de stock con el motivo
```

**Scenario: ajuste negativo (merma)**
```
Given el producto existe
  And el usuario selecciona tipo=AJUSTE_NEGATIVO, cantidad=2, motivo="Producto vencido"
When confirma
Then MUST disminuir current_stock en 2
```

### Sad Paths

**Scenario: motivo vacío**
```
Given el usuario no ingresa motivo
When confirma el ajuste
Then MUST retornar 400 con mensaje "El motivo es obligatorio para ajustes manuales"
```

**Scenario: producto inexistente**
```
Given el producto_id no existe en DB
When se envía el ajuste
Then MUST retornar 404
```

> **Gap conocido**: ajuste negativo que resulta en stock < 0 es técnicamente permitido.
> No hay validación de stock mínimo en ajustes manuales (solo en ventas).

---

## UC-PROD-04 — Stock bajo mínimo

**Scenario: productos bajo mínimo**
```
Given hay productos con current_stock < min_stock
When se consulta GET /api/productos/stock/low
Then MUST retornar solo esos productos
  And el dashboard MUST reflejar el conteo
```

---

## Estado de implementación
- ✅ GET /api/productos — lista activos
- ✅ POST /api/productos — crea (con límite 50)
- ✅ PATCH /api/productos/:id — actualiza
- ✅ DELETE /api/productos/:id — desactiva (soft delete)
- ✅ POST /api/productos/:id/stock/adjust — ajuste manual
- ✅ GET /api/productos/stock/low — productos bajo mínimo
- 🔲 UI de edición/desactivación de producto (endpoints listos, UI básica)
