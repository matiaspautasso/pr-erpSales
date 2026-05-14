import { useState } from 'react';
import { useCompras, type CreateCompraDto } from './useCompras';
import { useProveedores, type CreateProveedorDto } from './useProveedores';
import { useProducts } from '../productos/useProducts';

function NewCompraModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (dto: CreateCompraDto) => Promise<void>;
}) {
  const { proveedores, create: createProveedor } = useProveedores();
  const { products } = useProducts();
  const [form, setForm] = useState<CreateCompraDto>({
    proveedor_id: 0,
    producto_id: 0,
    quantity: 0,
    unit_cost: 0,
    date: new Date().toISOString().slice(0, 10),
  });
  const [newProvName, setNewProvName] = useState('');
  const [showNewProv, setShowNewProv] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddProveedor() {
    if (!newProvName.trim()) return;
    const dto: CreateProveedorDto = { name: newProvName.trim() };
    const proveedor = await createProveedor(dto);
    setForm((f) => ({ ...f, proveedor_id: proveedor.id }));
    setNewProvName('');
    setShowNewProv(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.proveedor_id || !form.producto_id) {
      setError('Seleccioná proveedor y producto.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(form);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al registrar la compra.');
    } finally {
      setSubmitting(false);
    }
  }

  const total = Number(form.quantity) * Number(form.unit_cost);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="font-heading text-lg font-semibold text-title mb-4">Nueva compra</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Proveedor</span>
            <div className="flex gap-2">
              <select
                required
                className="input flex-1"
                value={form.proveedor_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, proveedor_id: Number(e.target.value) }))}
              >
                <option value="">Seleccioná un proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowNewProv(!showNewProv)} className="btn-secondary text-xs px-3">
                + Nuevo
              </button>
            </div>
          </label>
          {showNewProv && (
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Nombre del proveedor"
                value={newProvName}
                onChange={(e) => setNewProvName(e.target.value)}
              />
              <button type="button" onClick={handleAddProveedor} className="btn-primary text-xs px-3">
                Agregar
              </button>
            </div>
          )}
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Producto</span>
            <select
              required
              className="input"
              value={form.producto_id || ''}
              onChange={(e) => setForm((f) => ({ ...f, producto_id: Number(e.target.value) }))}
            >
              <option value="">Seleccioná un producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.unit_of_sale === 'kg' ? 'kg' : 'unidad'})</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Cantidad</span>
              <input type="number" min="0.001" step="0.001" required className="input" value={form.quantity || ''} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-sm text-text-primary">Costo unitario ($)</span>
              <input type="number" min="0.01" step="0.01" required className="input" value={form.unit_cost || ''} onChange={(e) => setForm((f) => ({ ...f, unit_cost: Number(e.target.value) }))} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Fecha</span>
            <input type="date" required className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </label>
          {total > 0 && (
            <p className="font-body text-sm text-text-secondary bg-background rounded-lg px-3 py-2">
              Total: <span className="font-semibold text-title">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </p>
          )}
          {error && <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Guardando...' : 'Registrar compra'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ComprasView() {
  const { compras, loading, error, create, refresh } = useCompras();
  const [showCreate, setShowCreate] = useState(false);

  async function handleCreate(dto: CreateCompraDto) {
    await create(dto);
    await refresh();
  }

  if (loading) return <div className="p-8 font-body text-text-secondary">Cargando compras...</div>;
  if (error) return <div className="p-8 font-body text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-title">Compras</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Nueva compra</button>
      </div>

      {compras.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center font-body text-text-secondary">
          No hay compras registradas.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Fecha</th>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Proveedor</th>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Producto</th>
                <th className="text-right px-4 py-3 font-body font-medium text-text-secondary">Cantidad</th>
                <th className="text-right px-4 py-3 font-body font-medium text-text-secondary">Costo unit.</th>
                <th className="text-right px-4 py-3 font-body font-medium text-text-secondary">Total</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-body text-text-secondary">{c.date}</td>
                  <td className="px-4 py-3 font-body text-text-primary">{c.proveedor?.name ?? `#${c.proveedor_id}`}</td>
                  <td className="px-4 py-3 font-body text-text-primary">{c.producto?.name ?? `#${c.producto_id}`}</td>
                  <td className="px-4 py-3 font-body text-text-primary text-right">{Number(c.quantity).toFixed(3)}</td>
                  <td className="px-4 py-3 font-body text-text-secondary text-right">${Number(c.unit_cost).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 font-body font-medium text-title text-right">${Number(c.total).toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <NewCompraModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
