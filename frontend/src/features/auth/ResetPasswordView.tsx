import { useState, type FormEvent } from 'react';

interface Props {
  onSubmit: (newPassword: string) => Promise<void>;
  error: string | null;
  loading: boolean;
  done: boolean;
  hasToken: boolean;
}

export function ResetPasswordView({ onSubmit, error, loading, done, hasToken }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }
    setLocalError(null);
    void onSubmit(password);
  }

  if (!hasToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="font-body text-sm text-error">
          Enlace inválido. Solicitá un nuevo enlace de recuperación.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-background-card rounded-2xl shadow-md w-full max-w-sm p-8">
        <h1 className="font-heading text-xl font-bold text-title text-center mb-8">
          Nueva contraseña
        </h1>

        {done ? (
          <p className="font-body text-sm text-success bg-success-bg rounded-lg px-4 py-3 text-center">
            Contraseña actualizada. Redirigiendo al inicio de sesión...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-body text-sm font-medium text-text-primary">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="border border-border rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirm" className="font-body text-sm font-medium text-text-primary">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="border border-border rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {(error ?? localError) && (
              <p className="font-body text-sm text-error bg-error-bg rounded-lg px-3 py-2">
                {error ?? localError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover text-white font-body font-medium rounded-lg py-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
