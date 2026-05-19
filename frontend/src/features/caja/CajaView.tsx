import { useState } from 'react';
import type { CashRegister, CashMovement, CashMovementType, CloseSummary } from './useCaja';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CajaViewProps {
  current: CashRegister | null;
  history: CashRegister[];
  currentMovements: CashMovement[];
  expectedBalance: number | null;
  closeSummary: CloseSummary | null;
  loading: boolean;
  error: string | null;
  onOpen: (opening_amount: number) => Promise<void>;
  onClose: (real_amount: number) => Promise<CashRegister>;
  onRegisterMovement: (type: CashMovementType, amount: number, description: string) => Promise<void>;
  onFetchCloseSummary?: () => Promise<void>;
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  debit: 'Débito',
  credit: 'Crédito',
};

// ─── Modales internos (UI pura, sin lógica de negocio) ───────────────────────

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

function CloseCajaModal({
  onClose,
  onCloseRegister,
  closeSummary,
}: {
  onClose: () => void;
  onCloseRegister: (real_amount: number) => Promise<CashRegister>;
  closeSummary: CloseSummary | null;
}) {
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
            <div className="flex justify-between">
              <span className="text-text-secondary">Saldo esperado</span>
              <span className="font-medium">${Number(result.closing_amount).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Monto real</span>
              <span className="font-medium">${Number(result.real_amount).toLocaleString('es-AR')}</span>
            </div>
            <div
              className={`flex justify-between font-semibold mt-2 pt-2 border-t border-border ${
                diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-700' : 'text-title'
              }`}
            >
              <span>Diferencia</span>
              <span>
                {diff >= 0 ? '+' : ''}${diff.toLocaleString('es-AR')}
              </span>
            </div>

            {closeSummary && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                  Ventas por medio de pago
                </p>
                {(Object.keys(closeSummary.paymentBreakdown) as Array<keyof typeof closeSummary.paymentBreakdown>).map(
                  (method) => (
                    <div key={method} className="flex justify-between">
                      <span className="text-text-secondary">{PAYMENT_LABELS[method]}</span>
                      <span className="font-medium">
                        ${closeSummary.paymentBreakdown[method].toLocaleString('es-AR')}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className="btn-primary w-full mt-4">
            Listo
          </button>
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
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Cerrando...' : 'Cerrar caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Formulario de egreso/retiro ─────────────────────────────────────────────

function MovementForm({
  onRegisterMovement,
}: {
  onRegisterMovement: (type: CashMovementType, amount: number, description: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'expense' | 'withdrawal'>('expense');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setFormError('El monto debe ser mayor a 0.');
      return;
    }
    if (!description.trim()) {
      setFormError('El concepto no puede estar vacío.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await onRegisterMovement(type, parsedAmount, description.trim());
      setAmount('');
      setDescription('');
      setType('expense');
    } catch {
      setFormError('Error al registrar el movimiento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
      <h2 className="font-heading text-base font-semibold text-title mb-4">Registrar egreso / retiro</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1" htmlFor="movement-amount">
          <span className="font-body text-sm text-text-primary">Monto ($)</span>
          <input
            id="movement-amount"
            type="number"
            min="0.01"
            step="0.01"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1" htmlFor="movement-description">
          <span className="font-body text-sm text-text-primary">Concepto</span>
          <input
            id="movement-description"
            type="text"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1" htmlFor="movement-type">
          <span className="font-body text-sm text-text-primary">Tipo</span>
          <select
            id="movement-type"
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as 'expense' | 'withdrawal')}
          >
            <option value="expense">Egreso</option>
            <option value="withdrawal">Retiro</option>
          </select>
        </label>
        {formError && (
          <p className="font-body text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Registrando...' : 'Registrar movimiento'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Lista de movimientos de la sesión activa ─────────────────────────────────

const MOVEMENT_LABELS: Record<string, string> = {
  income: 'Ingreso',
  expense: 'Egreso',
  withdrawal: 'Retiro',
};

function MovimientosSesion({
  movements,
  expectedBalance,
}: {
  movements: CashMovement[];
  expectedBalance: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-base font-semibold text-title">Movimientos de sesión</h2>
        <div className="text-right">
          <p className="font-body text-xs text-text-secondary">Saldo esperado</p>
          <p className="font-heading text-lg font-bold text-title">
            ${expectedBalance.toLocaleString('es-AR')}
          </p>
        </div>
      </div>
      {movements.length === 0 ? (
        <p className="font-body text-sm text-text-secondary">Sin movimientos registrados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {movements.map((m) => (
            <div key={m.id} className="flex items-center justify-between font-body text-sm">
              <div>
                <span className="text-text-secondary text-xs">{MOVEMENT_LABELS[m.type] ?? m.type}</span>
                {m.description && (
                  <p className="text-text-primary">{m.description}</p>
                )}
              </div>
              <span className={`font-medium ${m.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>
                {m.type === 'income' ? '+' : '-'}${Number(m.amount).toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Historial de cajas cerradas ─────────────────────────────────────────────

function HistorialCajas({ history }: { history: CashRegister[] }) {
  return (
    <div className="mt-6">
      <h2 className="font-heading text-lg font-semibold text-title mb-3">Historial de cajas</h2>
      <div className="flex flex-col gap-3">
        {history.map((reg) => {
          const diff = Number(reg.difference);
          return (
            <div key={reg.id} className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-4 gap-2 font-body text-sm">
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Fecha</p>
                <p className="font-medium text-text-primary">
                  {new Date(reg.opened_at).toLocaleDateString('es-AR', { dateStyle: 'short' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Apertura</p>
                <p className="font-medium text-text-primary">
                  ${Number(reg.opening_amount).toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Cierre esperado</p>
                <p className="font-medium text-text-primary">
                  ${Number(reg.closing_amount).toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Diferencia</p>
                <p
                  className={`font-semibold ${
                    diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-700' : 'text-title'
                  }`}
                >
                  {`${diff >= 0 ? '+' : '-'}$${Math.abs(diff).toLocaleString('es-AR')}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── View principal ───────────────────────────────────────────────────────────

export function CajaView({
  current,
  history,
  currentMovements,
  expectedBalance,
  closeSummary,
  loading,
  error,
  onOpen,
  onClose,
  onRegisterMovement,
  onFetchCloseSummary,
}: CajaViewProps) {
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);

  if (loading) return <div className="p-8 font-body text-text-secondary">Cargando caja...</div>;
  if (error) return <div className="p-8 font-body text-red-600">{error}</div>;

  const isOpen = !!current;

  async function handleOpenCloseModal() {
    if (onFetchCloseSummary) {
      await onFetchCloseSummary();
    }
    setShowClose(true);
  }

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
        <>
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
                  {new Date(current.opened_at).toLocaleString('es-AR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <button onClick={() => void handleOpenCloseModal()} className="btn-secondary">
                Cerrar caja
              </button>
            </div>
          </div>

          {expectedBalance !== null && (
            <MovimientosSesion movements={currentMovements} expectedBalance={expectedBalance} />
          )}

          <MovementForm onRegisterMovement={onRegisterMovement} />
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4">
          <p className="font-body text-text-secondary">No hay sesión de caja activa.</p>
          <button onClick={() => setShowOpen(true)} className="btn-primary">
            Abrir caja
          </button>
        </div>
      )}

      {history.length > 0 && <HistorialCajas history={history} />}

      {showOpen && <OpenCajaModal onClose={() => setShowOpen(false)} onOpen={onOpen} />}
      {showClose && (
        <CloseCajaModal
          onClose={() => setShowClose(false)}
          onCloseRegister={onClose}
          closeSummary={closeSummary}
        />
      )}
    </div>
  );
}
