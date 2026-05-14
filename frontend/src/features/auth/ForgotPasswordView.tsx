import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  onSubmit: (email: string) => Promise<void>;
  error: string | null;
  loading: boolean;
  sent: boolean;
}

export function ForgotPasswordView({ onSubmit, error, loading, sent }: Props) {
  const [email, setEmail] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void onSubmit(email);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-background-card rounded-2xl shadow-md w-full max-w-sm p-8">
        <h1 className="font-heading text-xl font-bold text-title text-center mb-1">
          Recuperar contraseña
        </h1>
        <p className="font-body text-sm text-text-secondary text-center mb-8">
          Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {sent ? (
          <div className="font-body text-sm text-success bg-success-bg rounded-lg px-4 py-3 text-center">
            Si el email está registrado, recibirás un enlace en tu bandeja de entrada.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-body text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border border-border rounded-lg px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-error bg-error-bg rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover text-white font-body font-medium rounded-lg py-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="font-body text-sm text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
