import { useForgotPassword } from './useForgotPassword';
import { ForgotPasswordView } from './ForgotPasswordView';

export function ForgotPasswordPage() {
  const { submit, error, loading, sent } = useForgotPassword();
  return <ForgotPasswordView onSubmit={submit} error={error} loading={loading} sent={sent} />;
}
