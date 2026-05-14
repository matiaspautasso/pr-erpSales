import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn() },
}));

import { http } from '../../shared/api/http';
import { usePOS } from './usePOS';

describe('usePOS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a GET /api/ventas al montar y expone la lista', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [{ id: 1, total: 500, status: 'confirmed' }] });

    const { result } = renderHook(() => usePOS());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(http.get).toHaveBeenCalledWith('/api/ventas');
    expect(result.current.ventas).toHaveLength(1);
  });

  it('cancelSale llama a POST /api/ventas/:id/cancel y actualiza el estado en la lista', async () => {
    const confirmedSale = { id: 5, total: 1000, status: 'confirmed', created_at: new Date().toISOString() };
    const cancelledSale = { ...confirmedSale, status: 'cancelled' };

    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [confirmedSale] });
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: cancelledSale });

    const { result } = renderHook(() => usePOS());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.cancelSale(5);
    });

    expect(http.post).toHaveBeenCalledWith('/api/ventas/5/cancel', {});
    expect(result.current.ventas[0].status).toBe('cancelled');
  });

  it('createSale llama a POST /api/ventas con los items', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: 3, total: 1000, status: 'confirmed' },
    });

    const { result } = renderHook(() => usePOS());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createSale([{ producto_id: 1, quantity: 2, unit_price: 500 }]);
    });

    expect(http.post).toHaveBeenCalledWith(
      '/api/ventas',
      expect.objectContaining({ items: expect.arrayContaining([expect.objectContaining({ producto_id: 1 })]) }),
    );
  });
});
