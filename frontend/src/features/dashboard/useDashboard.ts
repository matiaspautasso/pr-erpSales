import { useState, useEffect } from 'react';
import { http } from '../../shared/api/http';

export interface DashboardKPIs {
  total_productos: number;
  productos_bajo_minimo: number;
  ventas_hoy: number;
  monto_ventas_hoy: number;
  estado_caja: 'abierta' | 'cerrada';
}

export function useDashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await http.get<DashboardKPIs>('/api/dashboard/kpis');
        setKpis(res.data);
      } catch {
        setError('Error al cargar el dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { kpis, loading, error };
}
