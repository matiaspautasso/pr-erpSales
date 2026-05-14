import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../shared/api/http';
import { useAuthContext } from '../../shared/auth/AuthContext';

interface LoginState {
  error: string | null;
  loading: boolean;
}

export function useLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [state, setState] = useState<LoginState>({ error: null, loading: false });

  async function submit(email: string, password: string): Promise<void> {
    setState({ error: null, loading: true });
    try {
      const res = await http.post<{ access_token: string }>('/api/auth/login', { email, password });
      login(res.data.access_token);
      navigate('/dashboard');
    } catch {
      setState({ error: 'Email o contraseña incorrectos.', loading: false });
      return;
    }
    setState({ error: null, loading: false });
  }

  return { submit, error: state.error, loading: state.loading };
}
