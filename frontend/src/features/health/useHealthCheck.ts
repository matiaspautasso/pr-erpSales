import { useState, useEffect } from 'react';
import { http } from '../../shared/api/http';

interface HealthStatus {
  status: 'ok' | 'error' | 'loading';
  database: 'ok' | 'unreachable' | 'unknown';
}

interface HealthApiResponse {
  status: 'ok' | 'error';
  database: 'ok' | 'unreachable';
}

export function useHealthCheck(): HealthStatus {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'loading',
    database: 'unknown',
  });

  useEffect(() => {
    http
      .get<HealthApiResponse>('/api/health')
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: 'error', database: 'unreachable' }));
  }, []);

  return health;
}
