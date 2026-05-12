# Specs del Sistema — Pollería Santi ERP

## Perfil del Negocio

| Atributo | Valor |
|----------|-------|
| Tipo | Pollería / carnicería, un solo local |
| Atención | Presencial por mostrador |
| Venta | Directa al consumidor final |
| Usuario del sistema | Dueño del negocio |
| Roles | Un único rol (dueño) — sin empleados ni múltiples roles en el MVP |

---

## Alcance Operativo Confirmado

### Ventas
**Incluido:**
- Ventas anónimas por mostrador al consumidor final
- Productos vendidos **exclusivamente por kilogramo**
- Pago en el momento de la venta
- Un único medio de pago por venta (efectivo, transferencia o tarjeta)
- Descuento porcentual opcional sobre el total de la venta
- Ticket interno opcional (no fiscal)

**No incluido:**
- Clientes registrados
- Cuenta corriente de clientes
- Ventas fiadas o a crédito
- Reparto / delivery
- Mayoristas
- Facturación fiscal / AFIP
- Combinación de múltiples medios de pago en una misma venta
- Modificación de precio por kg al momento de la venta

---

## Balanza

La pollería usa balanza física, pero el sistema **no se integra** con ella.

**Operatoria:** el dueño pesa el producto en la balanza y carga el peso manualmente.

**Ejemplo:**
```
Producto: Pechuga
Peso: 1.250 kg
Precio por kg: $4.500
Subtotal: $5.625
```

**Fórmula:**
```
subtotal = kilos_vendidos × precio_por_kg
```

---

## Productos

### Unidad de venta
Todos los productos se venden **por kilogramo**. No existen productos por unidad entera.

### Datos requeridos por producto

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Nombre | texto | Ej: Pechuga, Carne picada |
| Categoría | selección | Agrupa productos en el POS |
| Precio por kg | decimal | Precio de venta — no modificable en la venta |
| Costo por kg | decimal | Referencia interna de costo |
| Stock actual | decimal (kg) | Existencias actuales |
| Stock mínimo | decimal (kg) | Umbral de alerta |
| Estado | activo / inactivo | Controla visibilidad en el POS |

### Ejemplos de productos
Pollo entero, Pechuga, Pata muslo, Alitas, Milanesa de pollo, Suprema, Carne picada, Chorizo, Morcilla

---

## Stock

### Regla principal
El stock se controla **en kilogramos** con decimales.

### Movimientos que modifican stock

| Tipo | Efecto | Origen |
|------|--------|--------|
| ENTRADA | Aumenta stock | Compra registrada |
| SALIDA | Disminuye stock | Venta confirmada |
| AJUSTE_POSITIVO | Aumenta stock | Ajuste manual (requiere motivo) |
| AJUSTE_NEGATIVO | Disminuye stock | Ajuste manual / merma (requiere motivo) |
| ANULACION_VENTA | Aumenta stock | Anulación de venta (revierte SALIDA) |

### Reglas
- No permitir vender más kg que el stock disponible
- Registrar todo movimiento de stock con fecha y origen
- Motivo obligatorio en ajustes manuales
- Mostrar alerta cuando el stock esté por debajo del mínimo

### Motivos válidos para ajuste
`Merma` | `Error de carga` | `Diferencia física` | `Producto vencido` | `Otro`

---

## Compras

### Tipo de compra
**Compra simple** — sin flujo de orden de compra ni recepciones parciales.

### Módulo de proveedores
ABM completo de proveedores:

| Campo | Descripción |
|-------|-------------|
| Nombre / razón social | |
| CUIT | |
| Teléfono | |
| Email | opcional |
| Observaciones | opcional |

Historial de compras por proveedor visible en el detalle del proveedor.

### Datos de una compra

| Campo | Descripción |
|-------|-------------|
| Fecha | Fecha de la compra |
| Proveedor | Selección del ABM |
| Producto | Selección del catálogo |
| Cantidad (kg) | Kilos comprados |
| Costo por kg | Costo de esta compra |
| Total | Calculado automáticamente |

### Impacto automático al registrar una compra
1. Aumenta el stock del producto
2. Guarda el costo de compra en el movimiento
3. Registra movimiento de stock tipo **ENTRADA**
4. Guarda en historial de compras

### No incluido en compras
- Órdenes de compra pendientes
- Recepciones parciales
- Deuda a proveedores / cuenta corriente
- Pago a proveedores

---

## Ventas / POS

### Tipo de venta
Venta rápida por mostrador.

### Flujo operativo

```
1. Caja abierta (prerequisito)
2. Seleccionar producto
3. Cargar kg vendidos
4. Sistema calcula subtotal
5. Agregar más productos si aplica
6. Aplicar descuento % (opcional)
7. Seleccionar UN medio de pago
8. Confirmar venta
9. Imprimir ticket interno (opcional)
```

### Impacto automático al confirmar una venta
1. Descuenta stock (tipo SALIDA)
2. Registra ingreso en caja
3. Guarda en historial de ventas

### Medios de pago disponibles
`Efectivo` | `Transferencia` | `Débito` | `Crédito`

> Un único medio por venta. No se combinan.

### Descuento
- Porcentual sobre el total de la venta
- Opcional
- No hay recargo

### Precio
El precio por kg es el cargado en el producto. **No se modifica al momento de la venta.**

### Anulación de ventas
- Disponible desde el historial de ventas
- Impacto: revierte stock (ANULACION_VENTA) y revierte el ingreso en caja
- Deja trazabilidad del movimiento inverso

---

## Ticket Interno

Ticket **opcional**, no fiscal.

### Contenido mínimo

| Campo |
|-------|
| Nombre del negocio |
| Fecha y hora |
| Número interno de venta |
| Productos (nombre, kg, precio por kg, subtotal) |
| Descuento aplicado (si aplica) |
| Total |
| Medio de pago |
| Leyenda: "Ticket interno — No válido como factura" |

---

## Caja

### Tipo
Caja simple con apertura y cierre formal.

### Flujo

```
Abrir caja (monto inicial)
  → Registrar ventas (automático)
  → Registrar egresos manuales
  → Registrar retiros
  → Ver saldo esperado
Cerrar caja
  → Cargar monto real contado
  → Calcular diferencia
  → Guardar historial
```

### Apertura de caja

| Campo | Descripción |
|-------|-------------|
| Fecha | |
| Hora de apertura | |
| Monto inicial | Efectivo en caja al abrir |

> **Regla:** No se puede registrar ventas si no hay una caja abierta.

### Movimientos de caja

| Tipo | Descripción | Origen |
|------|-------------|--------|
| Ingreso por venta | Automático | Venta confirmada |
| Egreso manual | Gasto del local, pago eventual, compra menor | Manual |
| Retiro | Retiro del dueño (propio, depósito, gastos personales) | Manual |

### Saldo esperado

```
saldo_esperado = monto_inicial + ventas_cobradas - egresos - retiros
```

Resumen también por medio de pago (efectivo, transferencia, débito, crédito).

### Cierre de caja

| Campo | Descripción |
|-------|-------------|
| Fecha y hora de cierre | |
| Monto esperado | Calculado por el sistema |
| Monto real contado | Ingresado por el dueño |
| Diferencia | `monto_real - monto_esperado_en_efectivo` |
| Observación | Opcional |

**Estados posibles:** Sin diferencia | Sobrante | Faltante

> El cierre se permite aunque haya diferencia — queda registrada.

### Historial de cajas cerradas

Fecha, apertura, cierre, monto inicial, total ventas, total egresos, total retiros, monto esperado, monto real, diferencia, estado.

---

## Autenticación

- Un único usuario: el dueño
- Login con email + contraseña
- JWT con expiración fija (sin refresh token)
- Sin recuperación de contraseña en el MVP

---

## Módulos del MVP

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | Auth | Login, sesión JWT |
| 2 | Dashboard | KPIs del día: ventas, caja, stock bajo, últimas operaciones |
| 3 | Productos / Stock | ABM productos, movimientos, ajustes y mermas |
| 4 | Compras | ABM proveedores, registro de compras simples |
| 5 | Ventas / POS | Venta rápida por kg, descuento, ticket interno, anulación |
| 6 | Caja | Apertura, egresos, retiros, saldo esperado, cierre, historial |

---

## No Alcance del MVP

El sistema **no tendrá:**

- Facturación fiscal / AFIP / controlador fiscal
- Integración con balanza o código de barras
- Clientes registrados o cuenta corriente
- Combinación de múltiples medios de pago en una venta
- Modificación de precio al momento de la venta
- Reparto / delivery / mayoristas
- Multi-sucursal
- Gestión de empleados, sueldos, turnos
- Contabilidad completa
- App móvil / e-commerce
- Roles múltiples o permisos granulares

---

## Casos Críticos

| Caso | Regla | Mensaje |
|------|-------|---------|
| Venta sin caja abierta | Bloqueado | "Debe abrir una caja antes de registrar ventas." |
| Venta con stock insuficiente | Bloqueado | "Stock insuficiente para completar la venta." |
| Cierre con diferencia | Permitido, queda registrado | Muestra diferencia y estado (faltante/sobrante) |
| Ajuste de stock sin motivo | Bloqueado | Motivo obligatorio |
| Compra registrada | Impacta stock automáticamente | — |
| Venta confirmada | Impacta stock y caja automáticamente | — |
| Anulación de venta | Revierte stock y caja | — |

---

## Principios de Diseño

- **Rápido** — el POS debe ser operable sin fricción
- **Simple** — usable por el dueño sin capacitación técnica
- **Claro** — cada operación importante deja historial
- **Trazable** — toda modificación de stock y caja queda registrada

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS + TypeScript |
| Frontend | React + TypeScript + Vite |
| Base de datos | PostgreSQL |
| Deploy | Railway (frontend + backend + DB) |
| Auth | JWT con expiración fija |
| Repo | Monorepo (backend + frontend en `erpPolleria/`) |

---

## Alcance de Directorios

- `erpPolleria/` → todo el sistema productivo (backend, frontend, docs, specs)
- `protPolleria/` → solo prototipos visuales — **nada transaccional**
