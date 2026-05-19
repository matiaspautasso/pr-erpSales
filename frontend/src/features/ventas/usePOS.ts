import { useState, useEffect, useCallback } from 'react';
import { http } from '../../shared/api/http';

export interface SaleItem {
  producto_id: number;
  quantity: number;
  unit_price: number;
}

export type PaymentMethod = 'cash' | 'transfer' | 'debit' | 'credit';

export interface Sale {
  id: number;
  total: number;
  status: 'confirmed' | 'cancelled';
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
}

export function usePOS() {
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Sale[]>('/api/ventas');
      setVentas(res.data);
    } catch {
      setError('Error al cargar las ventas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVentas();
  }, [fetchVentas]);

  async function cancelSale(id: number): Promise<void> {
    const res = await http.post<Sale>(`/api/ventas/${id}/cancel`, {});
    setVentas((prev) => prev.map((v) => (v.id === id ? res.data : v)));
  }

  async function createSale(items: SaleItem[], notes?: string, payment_method?: PaymentMethod, discount_percent?: number): Promise<Sale> {
    if (!payment_method) {
      throw new Error('Debe seleccionar un medio de pago');
    }
    const res = await http.post<Sale>('/api/ventas', { items, notes, payment_method, discount_percent: discount_percent ?? 0 });
    setVentas((prev) => [res.data, ...prev]);
    return res.data;
  }

  return { ventas, loading, error, createSale, cancelSale, refresh: fetchVentas };
}
