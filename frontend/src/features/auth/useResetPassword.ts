import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from '../../shared/api/http';

interface ResetPasswordState {
  error: string | null;
  loading: boolean;
  done: boolean;
}

export function useResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<ResetPasswordState>({ error: null, loading: false, done: false });

  const token = searchParams.get('token') ?? '';

  async function submit(newPassword: string): Promise<void> {
    setState({ error: null, loading: true, done: false });
    try {
      await http.post('/api/auth/reset-password', { token, new_password: newPassword });
      setState({ error: null, loading: false, done: true });
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setState({ error: 'El enlace es inválido o ya expiró.', loading: false, done: false });
    }
  }

  return { submit, error: state.error, loading: state.loading, done: state.done, hasToken: !!token };
}
