import { useState } from 'react';
import { useCaja, type CashRegister } from './useCaja';

function OpenCajaModal({ onClose, onOpen }: { onClose: () => void; onOpen: (amount: number) => Promise<void> }) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onOpen(Number(amount));
      onClose();
    } catch {
      setError('Error al abrir la caja.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <h2 className="font-heading text-lg font-semibold text-title mb-4">Abrir caja</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Monto de apertura ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </label>
          {error && <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Abriendo...' : 'Abrir caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloseCajaModal({ onClose, onCloseRegister }: { onClose: () => void; onCloseRegister: (real_amount: number) => Promise<CashRegister> }) {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<CashRegister | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const closed = await onCloseRegister(Number(amount));
      setResult(closed);
    } catch {
      setError('Error al cerrar la caja.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const diff = Number(result.difference);
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
          <h2 className="font-heading text-lg font-semibold text-title mb-4">Cierre de caja</h2>
          <div className="flex flex-col gap-2 font-body text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Saldo esperado</span><span className="font-medium">${Number(result.closing_amount).toLocaleString('es-AR')}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Monto real</span><span className="font-medium">${Number(result.real_amount).toLocaleString('es-AR')}</span></div>
            <div className={`flex justify-between font-semibold mt-2 pt-2 border-t border-border ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-700' : 'text-title'}`}>
              <span>Diferencia</span>
              <span>{diff >= 0 ? '+' : ''}${diff.toLocaleString('es-AR')}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-primary w-full mt-4">Listo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <h2 className="font-heading text-lg font-semibold text-title mb-4">Cerrar caja</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-primary">Monto real en caja ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </label>
          {error && <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Cerrando...' : 'Cerrar caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CajaView() {
  const { current, loading, error, open, close } = useCaja();
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);

  if (loading) return <div className="p-8 font-body text-text-secondary">Cargando caja...</div>;
  if (error) return <div className="p-8 font-body text-red-600">{error}</div>;

  const isOpen = !!current;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-title">Caja</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className={`font-body text-sm font-medium ${isOpen ? 'text-green-700' : 'text-gray-500'}`}>
            {isOpen ? 'Abierta' : 'Cerrada'}
          </span>
        </div>
      </div>

      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-body text-xs text-text-secondary mb-0.5">Apertura</p>
              <p className="font-heading text-2xl font-bold text-title">
                ${Number(current.opening_amount).toLocaleString('es-AR')}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-text-secondary mb-0.5">Abierta desde</p>
              <p className="font-body text-sm text-text-primary">
                {new Date(current.opened_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <button onClick={() => setShowClose(true)} className="btn-secondary">Cerrar caja</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4">
          <p className="font-body text-text-secondary">No hay sesión de caja activa.</p>
          <button onClick={() => setShowOpen(true)} className="btn-primary">Abrir caja</button>
        </div>
      )}

      {showOpen && (
        <OpenCajaModal onClose={() => setShowOpen(false)} onOpen={open} />
      )}
      {showClose && (
        <CloseCajaModal onClose={() => setShowClose(false)} onCloseRegister={close} />
      )}
    </div>
  );
}
