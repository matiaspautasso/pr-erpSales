import { useState } from 'react';
import { type Product, type CreateProductDto, type UpdateProductDto, useProducts } from './useProducts';
import { useStock, type AdjustStockDto } from './useStock';

const ADJUSTMENT_REASONS = ['Merma', 'Error de carga', 'Diferencia física', 'Producto vencido', 'Otro'];

function StatusBadge({ status }: { status: Product['status'] }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-body font-medium ${
      status === 'active'
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-100 text-gray-500'
    }`}>
      {status === 'active' ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function StockBadge({ current, min }: { current: number; min: number }) {
  const low = Number(current) < Number(min);
  return (
    <span className={`font-body text-sm ${low ? 'text-red-600 font-semibold' : 'text-text-primary'}`}>
      {Number(current).toFixed(3)}
      {low && <span className="ml-1 text-xs">⚠</span>}
    </span>
  );
}

function CreateProductModal({ onClose, onCreate }: { onClose: () => void; onCreate: (dto: CreateProductDto) => Promise<void> }) {
  const [form, setForm] = useState<CreateProductDto>({
    name: '', category: '', unit_of_sale: 'kg', price: 0, cost: 0, current_stock: 0, min_stock: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(form);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al crear el producto.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="font-heading text-lg font-semibold text-title mb-4">Nuevo producto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Nombre</span>
              <input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Categoría</span>
              <input required className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Unidad de venta</span>
            <select className="input" value={form.unit_of_sale} onChange={e => setForm(f => ({ ...f, unit_of_sale: e.target.value as 'kg' | 'unit' }))}>
              <option value="kg">Kilogramo (kg)</option>
              <option value="unit">Unidad</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Precio ($)</span>
              <input type="number" min="0" step="0.01" required className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Costo ($)</span>
              <input type="number" min="0" step="0.01" required className="input" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Stock inicial</span>
              <input type="number" min="0" step="0.001" required className="input" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: Number(e.target.value) }))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Stock mínimo</span>
              <input type="number" min="0" step="0.001" required className="input" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: Number(e.target.value) }))} />
            </label>
          </div>
          {error && <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditProductModal({ product, onClose, onUpdate }: { product: Product; onClose: () => void; onUpdate: (dto: UpdateProductDto) => Promise<void> }) {
  const [form, setForm] = useState<UpdateProductDto>({
    name: product.name,
    category: product.category,
    price: product.price,
    cost: product.cost,
    min_stock: product.min_stock,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onUpdate(form);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al editar el producto.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="font-heading text-lg font-semibold text-title mb-4">Editar producto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Nombre</span>
              <input required className="input" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Categoría</span>
              <input required className="input" value={form.category ?? ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Precio ($)</span>
              <input type="number" min="0" step="0.01" required className="input" value={form.price ?? 0} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Costo ($)</span>
              <input type="number" min="0" step="0.01" required className="input" value={form.cost ?? 0} onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Stock mínimo</span>
            <input type="number" min="0" step="0.001" required className="input" value={form.min_stock ?? 0} onChange={e => setForm(f => ({ ...f, min_stock: Number(e.target.value) }))} />
          </label>
          {error && <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustStockModal({ product, onClose, onAdjust }: { product: Product; onClose: () => void; onAdjust: (dto: AdjustStockDto) => Promise<void> }) {
  const [form, setForm] = useState<AdjustStockDto>({ type: 'AJUSTE_POSITIVO', quantity: 0, reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onAdjust(form);
      onClose();
    } catch {
      setError('Error al ajustar el stock.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <h2 className="font-heading text-lg font-semibold text-title mb-1">Ajustar stock</h2>
        <p className="font-body text-sm text-text-secondary mb-4">{product.name}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Tipo</span>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AdjustStockDto['type'] }))}>
              <option value="AJUSTE_POSITIVO">Positivo (suma)</option>
              <option value="AJUSTE_NEGATIVO">Negativo (resta)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Cantidad</span>
            <input type="number" min="0.001" step="0.001" required className="input" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Motivo</span>
            <select required className="input" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
              <option value="">Seleccioná un motivo</option>
              {ADJUSTMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          {error && <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Guardando...' : 'Ajustar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProductsView() {
  const { products, loading, error, create, update, refresh } = useProducts();
  const { adjust } = useStock();
  const [showCreate, setShowCreate] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);

  async function handleAdjust(dto: AdjustStockDto) {
    if (!adjustTarget) return;
    await adjust(adjustTarget.id, dto);
    await refresh();
  }

  async function handleUpdate(dto: UpdateProductDto) {
    if (!editTarget) return;
    await update(editTarget.id, dto);
  }

  async function handleDeactivate(product: Product) {
    if (!window.confirm(`¿Desactivar el producto "${product.name}"?`)) return;
    await update(product.id, { status: 'inactive' });
  }

  if (loading) {
    return <div className="p-8 font-body text-text-secondary">Cargando productos...</div>;
  }

  if (error) {
    return <div className="p-8 font-body text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-title">Productos</h1>
          <p className="font-body text-sm text-text-secondary mt-0.5">{products.length}/50 productos</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={products.length >= 50}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Nuevo producto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center font-body text-text-secondary">
          No hay productos. Agregá el primero.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Nombre</th>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Categoría</th>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Unidad</th>
                <th className="text-right px-4 py-3 font-body font-medium text-text-secondary">Precio</th>
                <th className="text-right px-4 py-3 font-body font-medium text-text-secondary">Costo</th>
                <th className="text-right px-4 py-3 font-body font-medium text-text-secondary">Stock actual</th>
                <th className="text-right px-4 py-3 font-body font-medium text-text-secondary">Stock mín.</th>
                <th className="text-center px-4 py-3 font-body font-medium text-text-secondary">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-body font-medium text-text-primary">{p.name}</td>
                  <td className="px-4 py-3 font-body text-text-secondary">{p.category}</td>
                  <td className="px-4 py-3 font-body text-text-secondary">{p.unit_of_sale === 'kg' ? 'Kg' : 'Unidad'}</td>
                  <td className="px-4 py-3 font-body text-text-primary text-right">${Number(p.price).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 font-body text-text-primary text-right" data-testid={`product-cost-${p.id}`}>${Number(p.cost).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right"><StockBadge current={p.current_stock} min={p.min_stock} /></td>
                  <td className="px-4 py-3 font-body text-text-secondary text-right">{Number(p.min_stock).toFixed(3)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setAdjustTarget(p)}
                        className="font-body text-xs text-primary hover:underline"
                      >
                        Ajustar stock
                      </button>
                      <button
                        onClick={() => setEditTarget(p)}
                        className="font-body text-xs text-primary hover:underline"
                      >
                        Editar
                      </button>
                      {p.status === 'active' && (
                        <button
                          onClick={() => handleDeactivate(p)}
                          className="font-body text-xs text-red-500 hover:underline"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateProductModal onClose={() => setShowCreate(false)} onCreate={create} />
      )}
      {adjustTarget && (
        <AdjustStockModal
          product={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onAdjust={handleAdjust}
        />
      )}
      {editTarget && (
        <EditProductModal
          product={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
