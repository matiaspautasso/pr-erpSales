import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn() },
}));

import { http } from '../../shared/api/http';
import { useCaja } from './useCaja';

describe('useCaja', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a GET /api/caja/current al montar y expone la caja actual', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: 1, opening_amount: 1000, status: 'open' },
    });

    const { result } = renderHook(() => useCaja());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(http.get).toHaveBeenCalledWith('/api/caja/current');
    expect(result.current.current?.status).toBe('open');
  });

  it('open llama a POST /api/caja/open con opening_amount', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null });
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: 1, opening_amount: 500, status: 'open' },
    });

    const { result } = renderHook(() => useCaja());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.open(500);
    });

    expect(http.post).toHaveBeenCalledWith('/api/caja/open', { opening_amount: 500 });
  });

  it('close llama a POST /api/caja/close con real_amount', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: 1, status: 'open' },
    });
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 1, status: 'closed' } });

    const { result } = renderHook(() => useCaja());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.close(1400);
    });

    expect(http.post).toHaveBeenCalledWith('/api/caja/close', { real_amount: 1400 });
  });

  it('fetchCurrentMovements llama a GET /api/caja/current/movements y expone movimientos y saldo', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 1, status: 'open' } });

    const movementsResponse = {
      data: {
        movements: [
          { id: 1, type: 'income', amount: 300, description: 'Venta #1', created_at: '2024-01-15T09:00:00Z' },
          { id: 2, type: 'expense', amount: 100, description: 'Compra', created_at: '2024-01-15T10:00:00Z' },
        ],
        expectedBalance: 700,
      },
    };
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(movementsResponse);

    const { result } = renderHook(() => useCaja());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.fetchCurrentMovements();
    });

    expect(http.get).toHaveBeenCalledWith('/api/caja/current/movements');
    expect(result.current.currentMovements).toHaveLength(2);
    expect(result.current.expectedBalance).toBe(700);
  });

  it('fetchCloseSummary llama a GET /api/caja/current/summary y expone el desglose por medio de pago', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 1, status: 'open' } });

    const summaryResponse = {
      data: {
        expectedBalance: 1500,
        paymentBreakdown: { cash: 1300, transfer: 200, debit: 0, credit: 0 },
      },
    };
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(summaryResponse);

    const { result } = renderHook(() => useCaja());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.fetchCloseSummary();
    });

    expect(http.get).toHaveBeenCalledWith('/api/caja/current/summary');
    expect(result.current.closeSummary?.paymentBreakdown.cash).toBe(1300);
    expect(result.current.closeSummary?.paymentBreakdown.transfer).toBe(200);
  });
});
