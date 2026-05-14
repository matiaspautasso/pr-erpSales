import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import { http } from '../../shared/api/http';
import { useProducts } from './useProducts';

const mockProducts = [
  { id: 1, name: 'Pechuga', category: 'Pollo', unit_of_sale: 'kg', price: 4500, cost: 3000, current_stock: 10, min_stock: 2, status: 'active' },
];

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a GET /api/productos al montar y expone la lista', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProducts });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(http.get).toHaveBeenCalledWith('/api/productos');
    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].name).toBe('Pechuga');
  });

  it('create llama a POST /api/productos con el dto', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProducts });
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { ...mockProducts[0], id: 2, name: 'Milanesa' } });

    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.create({ name: 'Milanesa', category: 'Cerdo', unit_of_sale: 'unit', price: 3000, cost: 2000, current_stock: 5, min_stock: 1 });
    });

    expect(http.post).toHaveBeenCalledWith('/api/productos', expect.objectContaining({ name: 'Milanesa' }));
  });

  it('expone error cuando GET falla', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('500'));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
  });
});
