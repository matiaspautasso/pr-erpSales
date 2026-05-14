import { useDashboard, type DashboardKPIs } from './useDashboard';

function KPICard({ label, value, sub, alert }: { label: string; value: string | number; sub?: string; alert?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-1 ${alert ? 'border-l-4 border-red-400' : ''}`}>
      <p className="font-body text-sm text-text-secondary">{label}</p>
      <p className={`font-heading text-3xl font-bold ${alert ? 'text-red-600' : 'text-title'}`}>{value}</p>
      {sub && <p className="font-body text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

function CajaCard({ estado }: { estado: DashboardKPIs['estado_caja'] }) {
  const open = estado === 'abierta';
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-1 ${open ? 'border-l-4 border-green-400' : 'border-l-4 border-gray-300'}`}>
      <p className="font-body text-sm text-text-secondary">Estado de caja</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`w-2.5 h-2.5 rounded-full ${open ? 'bg-green-500' : 'bg-gray-400'}`} />
        <p className={`font-heading text-xl font-bold ${open ? 'text-green-700' : 'text-gray-500'}`}>
          {open ? 'Abierta' : 'Cerrada'}
        </p>
      </div>
      <p className="font-body text-xs text-text-secondary">
        {open ? 'Sesión de caja activa' : 'Sin sesión activa'}
      </p>
    </div>
  );
}

export function DashboardView() {
  const { kpis, loading, error } = useDashboard();

  if (loading) {
    return <div className="p-8 font-body text-text-secondary">Cargando dashboard...</div>;
  }

  if (error || !kpis) {
    return <div className="p-8 font-body text-red-600">{error ?? 'Error desconocido'}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-title">Dashboard</h1>
        <p className="font-body text-sm text-text-secondary mt-0.5">Resumen del día</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          label="Ventas hoy"
          value={kpis.ventas_hoy}
          sub={`$${Number(kpis.monto_ventas_hoy).toLocaleString('es-AR')}`}
        />
        <KPICard
          label="Productos activos"
          value={kpis.total_productos}
          sub="de 50 máximo"
        />
        <KPICard
          label="Stock bajo mínimo"
          value={kpis.productos_bajo_minimo}
          sub="productos con alerta"
          alert={kpis.productos_bajo_minimo > 0}
        />
        <CajaCard estado={kpis.estado_caja} />
      </div>

      {kpis.productos_bajo_minimo > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-body text-sm font-medium text-red-700">
            ⚠ {kpis.productos_bajo_minimo} producto{kpis.productos_bajo_minimo !== 1 ? 's' : ''} con stock por debajo del mínimo.
          </p>
          <a href="/productos" className="font-body text-sm text-red-600 underline mt-1 inline-block">
            Ver productos →
          </a>
        </div>
      )}
    </div>
  );
}
