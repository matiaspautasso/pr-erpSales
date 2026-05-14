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
- Productos vendidos **por kilogramo o por unidad**, según la configuración del producto
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
- Modificación de precio al momento de la venta (ni por kg ni por unidad)

---

## Balanza

La pollería usa balanza física, pero el sistema **no se integra** con ella.

**Aplica solo a productos vendidos por kg.** Los productos por unidad no requieren balanza.

**Operatoria:** el dueño pesa el producto en la balanza y carga el peso manualmente en el sistema.

**Ejemplo:**
```
Producto: Pechuga (por kg)
Peso: 1.250 kg
Precio por kg: $4.500
Subtotal: $5.625

Producto: Pollo entero (por unidad)
Cantidad: 2 unidades
Precio por unidad: $8.000
Subtotal: $16.000
```

**Fórmulas:**
```
subtotal (kg)     = kilos_vendidos × precio_por_kg
subtotal (unidad) = unidades_vendidas × precio_por_unidad
```

---

## Productos

### Unidad de venta
Cada producto se configura como **por kilogramo** o **por unidad**. La unidad de venta no se puede cambiar al momento de la venta.

| Tipo | Descripción | Ejemplos |
|------|-------------|---------|
| `kg` | Se vende pesado; el dueño carga los kilos manualmente | Pechuga, Carne picada, Chorizo a granel |
| `unidad` | Se vende en piezas enteras; el dueño carga la cantidad | Pollo entero, Milanesa individual |

### Datos requeridos por producto

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Nombre | texto | Ej: Pechuga, Carne picada |
| Categoría | selección | Agrupa productos en el POS |
| Unidad de venta | `kg` / `unidad` | Define cómo se vende y cómo se controla el stock |
| Precio de venta | decimal | Por kg o por unidad según la configuración — no modificable en la venta |
| Costo | decimal | Referencia interna de costo (por kg o por unidad) |
| Stock actual | decimal | En kg si es por peso; entero si es por unidad |
| Stock mínimo | decimal | Umbral de alerta (misma unidad que stock actual) |
| Estado | activo / inactivo | Controla visibilidad en el POS |

### Ejemplos de productos
- **Por kg:** Pechuga, Pata muslo, Alitas, Carne picada, Chorizo a granel, Morcilla
- **Por unidad:** Pollo entero, Suprema, Milanesa de pollo

---

## Stock

### Regla principal
El stock se controla según la unidad de venta del producto:
- Productos **por kg**: stock en kilogramos con decimales (ej: `1.250`)
- Productos **por unidad**: stock en enteros sin decimales (ej: `12`)

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
| Cantidad | Kilos comprados (producto por kg) o unidades compradas (producto por unidad) |
| Costo unitario | Costo por kg o por unidad según el tipo del producto |
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
3. Cargar cantidad: kg si el producto es por peso, unidades si es por unidad
4. Sistema calcula subtotal (cantidad × precio)
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
El precio (por kg o por unidad según el producto) es el cargado en el catálogo. **No se modifica al momento de la venta.**

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
| Productos (nombre, cantidad [kg o unidades], precio, subtotal) |
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
- **Recuperación de contraseña vía Google:** el sistema envía un email de reseteo usando el servicio de Google (Gmail / Google SMTP). El dueño recibe un link con token temporal, accede y establece nueva contraseña.

### Flujo de recuperación de contraseña

```
1. Dueño hace click en "Olvidé mi contraseña"
2. Ingresa su email registrado
3. Sistema genera token de reseteo con expiración (ej: 1 hora)
4. Sistema envía email via Google SMTP con link: /reset-password?token=xxx
5. Dueño abre el link, ingresa nueva contraseña
6. Sistema invalida el token y actualiza la contraseña
7. Dueño inicia sesión normalmente
```

> El email de envío es una cuenta de Google configurada en variables de entorno. El token se almacena en base de datos con fecha de expiración.

---

## Módulos del MVP

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | Auth | Login, sesión JWT, recuperación de contraseña vía Google SMTP |
| 2 | Dashboard | KPIs del día: ventas, caja, stock bajo, últimas operaciones |
| 3 | Productos / Stock | ABM productos, movimientos, ajustes y mermas |
| 4 | Compras | ABM proveedores, registro de compras simples |
| 5 | Ventas / POS | Venta rápida por kg, descuento, ticket interno, anulación |
| 6 | Caja | Apertura, egresos, retiros, saldo esperado, cierre, historial |

---

## No Alcance del MVP

El sistema **no tendrá:**

**Normativa fiscal y pagos:**
- Facturación fiscal / AFIP / controlador fiscal
- Cumplimiento de normativa impositiva (no emite facturas A, B ni C)
- Integración con Mercado Pago ni ningún gateway de cobro externo — los medios de pago (efectivo, transferencia, débito, crédito) se registran manualmente

**Dispositivos externos:**
- Integración con balanza comercial (el peso se carga manualmente)
- Integración con lector de código de barras
- Integración con impresora fiscal
- Integración con cualquier otro dispositivo externo de hardware

**Funcionalidades fuera de alcance:**
- Clientes registrados o cuenta corriente
- Combinación de múltiples medios de pago en una venta
- Modificación de precio al momento de la venta (ni por kg ni por unidad)
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
| Email (recupero de contraseña) | Google SMTP via Nodemailer (App Password) |
| Repo | Monorepo (backend + frontend en `erpPolleria/`) |

---

## Alcance de Directorios

- `erpPolleria/` → todo el sistema productivo (backend, frontend, docs, specs)
- `protPolleria/` → solo prototipos visuales — **nada transaccional**
