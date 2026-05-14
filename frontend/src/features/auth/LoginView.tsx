import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  onSubmit: (email: string, password: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export function LoginView({ onSubmit, error, loading }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void onSubmit(email, password);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-background-card rounded-2xl shadow-md w-full max-w-sm p-8">
        <h1 className="font-heading text-2xl font-bold text-title text-center mb-1">
          Pollería Santi
        </h1>
        <p className="font-body text-sm text-text-secondary text-center mb-8">
          Sistema de Gestión
        </p>

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

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-body text-sm font-medium text-text-primary">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
            className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-body font-medium rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="font-body text-sm text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}
