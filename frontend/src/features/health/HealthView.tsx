interface Props {
  status: 'ok' | 'error' | 'loading';
  database: 'ok' | 'unreachable' | 'unknown';
}

const statusLabel: Record<Props['status'], string> = {
  ok: 'Operativo',
  error: 'Error',
  loading: 'Verificando...',
};

const dbLabel: Record<Props['database'], string> = {
  ok: 'Conectada',
  unreachable: 'Sin conexión',
  unknown: '—',
};

const statusColor: Record<Props['status'], string> = {
  ok: 'text-success',
  error: 'text-error',
  loading: 'text-text-secondary',
};

const dbColor: Record<Props['database'], string> = {
  ok: 'text-success',
  unreachable: 'text-error',
  unknown: 'text-text-secondary',
};

export function HealthView({ status, database }: Props) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-border p-8 w-full max-w-md">
        <h1 className="font-heading text-2xl font-semibold text-title mb-6">
          Estado del sistema
        </h1>
        <div className="space-y-1">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary font-body text-sm">API Backend</span>
            <span className={`font-semibold font-body text-sm ${statusColor[status]}`}>
              {statusLabel[status]}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-text-secondary font-body text-sm">Base de datos</span>
            <span className={`font-semibold font-body text-sm ${dbColor[database]}`}>
              {dbLabel[database]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
