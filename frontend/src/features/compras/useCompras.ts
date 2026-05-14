import { useState, useEffect, useCallback } from 'react';
import { http } from '../../shared/api/http';

export interface Proveedor {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface Compra {
  id: number;
  proveedor_id: number;
  producto_id: number;
  quantity: number;
  unit_cost: number;
  total: number;
  date: string;
  notes: string | null;
  proveedor?: Proveedor;
  producto?: { id: number; name: string; unit_of_sale: 'kg' | 'unit' };
}

export interface CreateCompraDto {
  proveedor_id: number;
  producto_id: number;
  quantity: number;
  unit_cost: number;
  date: string;
  notes?: string;
}

export function useCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Compra[]>('/api/compras');
      setCompras(res.data);
    } catch {
      setError('Error al cargar las compras.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCompras();
  }, [fetchCompras]);

  async function create(dto: CreateCompraDto): Promise<void> {
    const res = await http.post<Compra>('/api/compras', dto);
    setCompras((prev) => [res.data, ...prev]);
  }

  return { compras, loading, error, create, refresh: fetchCompras };
}
