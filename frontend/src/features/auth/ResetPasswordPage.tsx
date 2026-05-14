import { useResetPassword } from './useResetPassword';
import { ResetPasswordView } from './ResetPasswordView';

export function ResetPasswordPage() {
  const { submit, error, loading, done, hasToken } = useResetPassword();
  return (
    <ResetPasswordView
      onSubmit={submit}
      error={error}
      loading={loading}
      done={done}
      hasToken={hasToken}
    />
  );
}
