import { useState, useEffect } from 'react';
import { http } from '../../shared/api/http';
import { type Proveedor } from './useCompras';

export interface CreateProveedorDto {
  name: string;
  phone?: string;
  email?: string;
}

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await http.get<Proveedor[]>('/api/proveedores');
        setProveedores(res.data);
      } catch {
        setError('Error al cargar los proveedores.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function create(dto: CreateProveedorDto): Promise<Proveedor> {
    const res = await http.post<Proveedor>('/api/proveedores', dto);
    setProveedores((prev) => [...prev, res.data]);
    return res.data;
  }

  return { proveedores, loading, error, create };
}
