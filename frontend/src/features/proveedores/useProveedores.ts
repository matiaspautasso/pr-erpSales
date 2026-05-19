import { useState, useEffect, useCallback } from 'react';
import { http } from '../../shared/api/http';

export interface Proveedor {
  id: number;
  name: string;
  cuit: string;
  phone: string | null;
  email: string | null;
  observaciones: string | null;
}

export interface CreateProveedorDto {
  name: string;
  cuit: string;
  phone?: string;
  email?: string;
  observaciones?: string;
}

export interface UpdateProveedorDto {
  name?: string;
  cuit?: string;
  phone?: string;
  email?: string;
  observaciones?: string;
}

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Proveedor[]>('/api/proveedores');
      setProveedores(res.data);
    } catch {
      setError('Error al cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProveedores();
  }, [fetchProveedores]);

  async function create(dto: CreateProveedorDto): Promise<Proveedor> {
    const res = await http.post<Proveedor>('/api/proveedores', dto);
    setProveedores((prev) => [...prev, res.data]);
    return res.data;
  }

  async function update(id: number, dto: UpdateProveedorDto): Promise<Proveedor> {
    const res = await http.patch<Proveedor>(`/api/proveedores/${id}`, dto);
    setProveedores((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res.data;
  }

  async function remove(id: number): Promise<void> {
    await http.delete(`/api/proveedores/${id}`);
    setProveedores((prev) => prev.filter((p) => p.id !== id));
  }

  return { proveedores, loading, error, create, update, remove, refresh: fetchProveedores };
}
