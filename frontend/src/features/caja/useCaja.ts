import { useState, useEffect, useCallback } from 'react';
import { http } from '../../shared/api/http';

export interface CashRegister {
  id: number;
  opening_amount: number;
  closing_amount: number | null;
  real_amount: number | null;
  difference: number | null;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
}

export function useCaja() {
  const [current, setCurrent] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<CashRegister | null>('/api/caja/current');
      setCurrent(res.data);
    } catch {
      setError('Error al cargar el estado de caja.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCurrent();
  }, [fetchCurrent]);

  async function open(opening_amount: number): Promise<void> {
    const res = await http.post<CashRegister>('/api/caja/open', { opening_amount });
    setCurrent(res.data);
  }

  async function close(real_amount: number): Promise<CashRegister> {
    const res = await http.post<CashRegister>('/api/caja/close', { real_amount });
    setCurrent(null);
    setHistory((prev) => [res.data, ...prev]);
    return res.data;
  }

  async function fetchHistory(): Promise<void> {
    const res = await http.get<CashRegister[]>('/api/caja/history');
    setHistory(res.data);
  }

  return { current, history, loading, error, open, close, fetchHistory, refresh: fetchCurrent };
}
