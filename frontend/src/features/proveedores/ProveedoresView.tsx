import { useState } from 'react';
import { useProveedores, type Proveedor, type CreateProveedorDto, type UpdateProveedorDto } from './useProveedores';

function CreateProveedorModal({ onClose, onCreate }: { onClose: () => void; onCreate: (dto: CreateProveedorDto) => Promise<void> }) {
  const [form, setForm] = useState<CreateProveedorDto>({ name: '', cuit: '' });
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
      setError(msg ?? 'Error al crear el proveedor.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="font-heading text-lg font-semibold text-title mb-4">Nuevo proveedor</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Nombre</span>
            <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">CUIT</span>
            <input required className="input" placeholder="20-12345678-9" value={form.cuit} onChange={(e) => setForm((f) => ({ ...f, cuit: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Teléfono</span>
            <input className="input" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || undefined }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Email</span>
            <input type="email" className="input" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || undefined }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Observaciones</span>
            <textarea className="input resize-none" rows={2} value={form.observaciones ?? ''} onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value || undefined }))} />
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

function EditProveedorModal({ proveedor, onClose, onUpdate }: { proveedor: Proveedor; onClose: () => void; onUpdate: (dto: UpdateProveedorDto) => Promise<void> }) {
  const [form, setForm] = useState<UpdateProveedorDto>({
    name: proveedor.name,
    cuit: proveedor.cuit,
    phone: proveedor.phone ?? undefined,
    email: proveedor.email ?? undefined,
    observaciones: proveedor.observaciones ?? undefined,
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
      setError(msg ?? 'Error al editar el proveedor.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="font-heading text-lg font-semibold text-title mb-4">Editar proveedor</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Nombre</span>
            <input required className="input" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">CUIT</span>
            <input required className="input" value={form.cuit ?? ''} onChange={(e) => setForm((f) => ({ ...f, cuit: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Teléfono</span>
            <input className="input" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || undefined }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Email</span>
            <input type="email" className="input" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || undefined }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Observaciones</span>
            <textarea className="input resize-none" rows={2} value={form.observaciones ?? ''} onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value || undefined }))} />
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

export function ProveedoresView() {
  const { proveedores, loading, error, create, update, remove } = useProveedores();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Proveedor | null>(null);

  async function handleCreate(dto: CreateProveedorDto) {
    await create(dto);
  }

  async function handleUpdate(dto: UpdateProveedorDto) {
    if (!editTarget) return;
    await update(editTarget.id, dto);
  }

  async function handleRemove(proveedor: Proveedor) {
    if (!window.confirm(`¿Eliminar el proveedor "${proveedor.name}"?`)) return;
    await remove(proveedor.id);
  }

  if (loading) return <div className="p-8 font-body text-text-secondary">Cargando proveedores...</div>;
  if (error) return <div className="p-8 font-body text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-title">Proveedores</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Nuevo proveedor</button>
      </div>

      {proveedores.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center font-body text-text-secondary">
          No hay proveedores registrados.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Nombre</th>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">CUIT</th>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Teléfono</th>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Email</th>
                <th className="text-left px-4 py-3 font-body font-medium text-text-secondary">Observaciones</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-body font-medium text-text-primary">{p.name}</td>
                  <td className="px-4 py-3 font-body text-text-secondary">{p.cuit}</td>
                  <td className="px-4 py-3 font-body text-text-secondary">{p.phone ?? '—'}</td>
                  <td className="px-4 py-3 font-body text-text-secondary">{p.email ?? '—'}</td>
                  <td className="px-4 py-3 font-body text-text-secondary">{p.observaciones ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditTarget(p)} className="font-body text-xs text-primary hover:underline">
                        Editar
                      </button>
                      <button onClick={() => handleRemove(p)} className="font-body text-xs text-red-500 hover:underline">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateProveedorModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
      {editTarget && (
        <EditProveedorModal
          proveedor={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
