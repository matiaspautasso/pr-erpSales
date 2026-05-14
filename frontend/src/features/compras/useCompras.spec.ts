import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn() },
}));

import { http } from '../../shared/api/http';
import { useCompras } from './useCompras';

const mockCompras = [
  { id: 1, proveedor_id: 1, producto_id: 2, quantity: 3, unit_cost: 500, total: 1500, date: '2026-05-13' },
];

describe('useCompras', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a GET /api/compras al montar y expone la lista', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCompras });

    const { result } = renderHook(() => useCompras());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(http.get).toHaveBeenCalledWith('/api/compras');
    expect(result.current.compras).toHaveLength(1);
  });

  it('create llama a POST /api/compras con el dto', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCompras });
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { ...mockCompras[0], id: 2 } });

    const { result } = renderHook(() => useCompras());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.create({ proveedor_id: 1, producto_id: 2, quantity: 5, unit_cost: 400, date: '2026-05-13' });
    });

    expect(http.post).toHaveBeenCalledWith('/api/compras', expect.objectContaining({ proveedor_id: 1 }));
  });
});
