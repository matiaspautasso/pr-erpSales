import { useState, useEffect, useCallback } from 'react';
import { http } from '../../shared/api/http';
import type { CashMovementType } from './CashMovementType';

export type { CashMovementType };

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

export interface CashMovement {
  id: number;
  cash_register_id: number;
  type: CashMovementType;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface PaymentBreakdown {
  cash: number;
  transfer: number;
  debit: number;
  credit: number;
}

export interface CloseSummary {
  expectedBalance: number;
  paymentBreakdown: PaymentBreakdown;
}

export function useCaja() {
  const [current, setCurrent] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [currentMovements, setCurrentMovements] = useState<CashMovement[]>([]);
  const [expectedBalance, setExpectedBalance] = useState<number | null>(null);
  const [closeSummary, setCloseSummary] = useState<CloseSummary | null>(null);
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

  async function registerMovement(type: CashMovementType, amount: number, description?: string): Promise<void> {
    await http.post('/api/caja/movements', { type, amount, description });
  }

  async function fetchCurrentMovements(): Promise<void> {
    const res = await http.get<{ movements: CashMovement[]; expectedBalance: number }>('/api/caja/current/movements');
    setCurrentMovements(res.data.movements);
    setExpectedBalance(res.data.expectedBalance);
  }

  async function fetchCloseSummary(): Promise<void> {
    const res = await http.get<CloseSummary>('/api/caja/current/summary');
    setCloseSummary(res.data);
  }

  return {
    current,
    history,
    currentMovements,
    expectedBalance,
    closeSummary,
    loading,
    error,
    open,
    close,
    fetchHistory,
    registerMovement,
    fetchCurrentMovements,
    fetchCloseSummary,
    refresh: fetchCurrent,
  };
}
