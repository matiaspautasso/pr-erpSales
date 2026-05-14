import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { post: vi.fn() },
}));

import { http } from '../../shared/api/http';
import { useStock } from './useStock';

describe('useStock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adjust llama a POST /api/productos/:id/stock/adjust con el dto', async () => {
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useStock());

    await act(async () => {
      await result.current.adjust(1, { type: 'AJUSTE_POSITIVO', quantity: 2.5, reason: 'Error de carga' });
    });

    expect(http.post).toHaveBeenCalledWith('/api/productos/1/stock/adjust', {
      type: 'AJUSTE_POSITIVO',
      quantity: 2.5,
      reason: 'Error de carga',
    });
  });

  it('expone error cuando adjust falla', async () => {
    (http.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('400'));

    const { result } = renderHook(() => useStock());

    await act(async () => {
      await result.current.adjust(1, { type: 'AJUSTE_NEGATIVO', quantity: 1, reason: 'Merma' });
    });

    expect(result.current.error).toBeTruthy();
  });
});
