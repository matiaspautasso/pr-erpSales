import { useHealthCheck } from './useHealthCheck';
import { HealthView } from './HealthView';

export function HealthPage() {
  const health = useHealthCheck();
  return <HealthView status={health.status} database={health.database} />;
}
