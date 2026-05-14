import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { get: vi.fn() },
}));

import { http } from '../../shared/api/http';
import { useDashboard } from './useDashboard';

const mockKPIs = {
  total_productos: 10,
  productos_bajo_minimo: 2,
  ventas_hoy: 0,
  monto_ventas_hoy: 0,
  estado_caja: 'cerrada',
};

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a GET /api/dashboard/kpis al montar y expone los KPIs', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockKPIs });

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(http.get).toHaveBeenCalledWith('/api/dashboard/kpis');
    expect(result.current.kpis?.total_productos).toBe(10);
    expect(result.current.kpis?.productos_bajo_minimo).toBe(2);
  });

  it('expone error cuando GET falla', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('500'));

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
  });
});
