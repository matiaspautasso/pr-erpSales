import { useState } from 'react';
import { http } from '../../shared/api/http';

export interface AdjustStockDto {
  type: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';
  quantity: number;
  reason: string;
}

export function useStock() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function adjust(productId: number, dto: AdjustStockDto): Promise<void> {
    setError(null);
    setLoading(true);
    try {
      await http.post(`/api/productos/${productId}/stock/adjust`, dto);
    } catch {
      setError('Error al ajustar el stock.');
    } finally {
      setLoading(false);
    }
  }

  return { adjust, error, loading };
}
