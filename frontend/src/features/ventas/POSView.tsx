import { useState } from 'react';
import { usePOS, type SaleItem } from './usePOS';
import { useProducts } from '../productos/useProducts';

interface CartItem extends SaleItem {
  name: string;
  unit_of_sale: 'kg' | 'unit';
}

function CartRow({
  item,
  onRemove,
  onQtyChange,
}: {
  item: CartItem;
  onRemove: () => void;
  onQtyChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium text-text-primary truncate">{item.name}</p>
        <p className="font-body text-xs text-text-secondary">
          ${Number(item.unit_price).toLocaleString('es-AR')} / {item.unit_of_sale === 'kg' ? 'kg' : 'ud'}
        </p>
      </div>
      <input
        type="number"
        min="0.001"
        step={item.unit_of_sale === 'kg' ? '0.001' : '1'}
        className="input w-24 text-right text-sm py-1"
        value={item.quantity}
        onChange={(e) => onQtyChange(Number(e.target.value))}
      />
      <p className="font-body text-sm font-semibold text-title w-24 text-right">
        ${(item.quantity * item.unit_price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </p>
      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 font-body text-sm px-1"
        title="Quitar"
      >
        ✕
      </button>
    </div>
  );
}

export function POSView() {
  const { ventas, loading, error, createSale, cancelSale, refresh } = usePOS();
  const [cancelling, setCancelling] = useState<number | null>(null);
  const { products } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);

  const total = cart.reduce((acc, i) => acc + i.quantity * i.unit_price, 0);

  function addToCart(productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existing = cart.find((i) => i.producto_id === productId);
    if (existing) {
      setCart((prev) =>
        prev.map((i) =>
          i.producto_id === productId
            ? { ...i, quantity: Number((i.quantity + (product.unit_of_sale === 'kg' ? 0.5 : 1)).toFixed(3)) }
            : i,
        ),
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          producto_id: product.id,
          name: product.name,
          unit_of_sale: product.unit_of_sale,
          quantity: product.unit_of_sale === 'kg' ? 0.5 : 1,
          unit_price: Number(product.price),
        },
      ]);
    }
    setSelectedProductId(0);
  }

  function updateQty(productId: number, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.producto_id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.producto_id === productId ? { ...i, quantity: qty } : i)),
      );
    }
  }

  async function handleConfirm() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setSaleError(null);
    try {
      await createSale(
        cart.map(({ producto_id, quantity, unit_price }) => ({ producto_id, quantity, unit_price })),
      );
      setCart([]);
      await refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSaleError(msg ?? 'Error al registrar la venta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Left panel: product picker + cart */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <h1 className="font-heading text-2xl font-bold text-title">Punto de Venta</h1>

        {/* Product selector */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="font-body text-sm font-medium text-text-secondary mb-2">Agregar producto</p>
          <div className="flex gap-2">
            <select
              className="input flex-1"
              value={selectedProductId || ''}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
            >
              <option value="">Seleccioná un producto</option>
              {products
                .filter((p) => p.status === 'active')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${Number(p.price).toLocaleString('es-AR')} / {p.unit_of_sale === 'kg' ? 'kg' : 'ud'}
                  </option>
                ))}
            </select>
            <button
              className="btn-primary px-4"
              onClick={() => selectedProductId && addToCart(selectedProductId)}
              disabled={!selectedProductId}
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-2xl shadow-sm flex-1 flex flex-col">
          <div className="px-4 pt-4 pb-2 border-b border-border">
            <p className="font-heading text-base font-semibold text-title">Carrito</p>
          </div>
          <div className="flex-1 overflow-auto px-4">
            {cart.length === 0 ? (
              <p className="font-body text-sm text-text-secondary py-6 text-center">
                Agregá productos para comenzar.
              </p>
            ) : (
              cart.map((item) => (
                <CartRow
                  key={item.producto_id}
                  item={item}
                  onRemove={() => setCart((prev) => prev.filter((i) => i.producto_id !== item.producto_id))}
                  onQtyChange={(qty) => updateQty(item.producto_id, qty)}
                />
              ))
            )}
          </div>
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-body font-medium text-text-secondary">Total</span>
              <span className="font-heading text-xl font-bold text-title">
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {saleError && (
              <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{saleError}</p>
            )}
            <button
              className="btn-primary w-full"
              onClick={handleConfirm}
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? 'Registrando...' : 'Confirmar venta'}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: recent sales */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-title">Ventas del día</h2>
        {loading ? (
          <p className="font-body text-sm text-text-secondary">Cargando...</p>
        ) : error ? (
          <p className="font-body text-sm text-red-600">{error}</p>
        ) : ventas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center font-body text-sm text-text-secondary">
            No hay ventas registradas.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {ventas.slice(0, 20).map((v) => (
              <div
                key={v.id}
                className={`flex items-center gap-2 px-4 py-3 border-b border-border last:border-0 ${
                  v.status === 'cancelled' ? 'opacity-50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-text-primary">
                    Venta #{v.id}
                    {v.status === 'cancelled' && (
                      <span className="ml-2 text-xs text-red-500 font-normal">anulada</span>
                    )}
                  </p>
                  <p className="font-body text-xs text-text-secondary">
                    {new Date(v.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="font-body text-sm font-semibold text-title">
                  ${Number(v.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
                {v.status === 'confirmed' && (
                  <button
                    title="Anular venta"
                    disabled={cancelling === v.id}
                    onClick={async () => {
                      if (!window.confirm(`¿Anular la venta #${v.id} por $${Number(v.total).toLocaleString('es-AR')}?`)) return;
                      setCancelling(v.id);
                      try {
                        await cancelSale(v.id);
                      } finally {
                        setCancelling(null);
                      }
                    }}
                    className="text-red-400 hover:text-red-600 disabled:opacity-40 font-body text-xs px-1 flex-shrink-0"
                  >
                    {cancelling === v.id ? '...' : 'Anular'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
