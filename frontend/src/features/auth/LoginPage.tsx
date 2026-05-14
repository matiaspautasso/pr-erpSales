import { useLogin } from './useLogin';
import { LoginView } from './LoginView';

export function LoginPage() {
  const { submit, error, loading } = useLogin();
  return <LoginView onSubmit={submit} error={error} loading={loading} />;
}
