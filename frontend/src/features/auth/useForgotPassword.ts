import { useState } from 'react';
import { http } from '../../shared/api/http';

interface ForgotPasswordState {
  error: string | null;
  loading: boolean;
  sent: boolean;
}

export function useForgotPassword() {
  const [state, setState] = useState<ForgotPasswordState>({ error: null, loading: false, sent: false });

  async function submit(email: string): Promise<void> {
    setState({ error: null, loading: true, sent: false });
    try {
      await http.post('/api/auth/forgot-password', { email });
      setState({ error: null, loading: false, sent: true });
    } catch {
      setState({ error: 'Ocurrió un error. Intentá de nuevo.', loading: false, sent: false });
    }
  }

  return { submit, error: state.error, loading: state.loading, sent: state.sent };
}
