import { useState, useEffect, useCallback } from 'react';
import { http } from '../../shared/api/http';

export interface Product {
  id: number;
  name: string;
  category: string;
  unit_of_sale: 'kg' | 'unit';
  price: number;
  cost: number;
  current_stock: number;
  min_stock: number;
  status: 'active' | 'inactive';
}

export interface CreateProductDto {
  name: string;
  category: string;
  unit_of_sale: 'kg' | 'unit';
  price: number;
  cost: number;
  current_stock: number;
  min_stock: number;
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  min_stock?: number;
  status?: 'active' | 'inactive';
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Product[]>('/api/productos');
      setProducts(res.data);
    } catch {
      setError('Error al cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  async function create(dto: CreateProductDto): Promise<void> {
    const res = await http.post<Product>('/api/productos', dto);
    setProducts((prev) => [...prev, res.data]);
  }

  async function update(id: number, dto: UpdateProductDto): Promise<void> {
    const res = await http.patch<Product>(`/api/productos/${id}`, dto);
    setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
  }

  return { products, loading, error, create, update, refresh: fetchProducts };
}
