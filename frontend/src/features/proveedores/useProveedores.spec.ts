import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { http } from '../../shared/api/http';
import { useProveedores } from './useProveedores';

const mockProveedores = [
  { id: 1, name: 'Proveedor A', cuit: '20-12345678-9', phone: null, email: null, observaciones: null },
  { id: 2, name: 'Proveedor B', cuit: '27-98765432-1', phone: null, email: null, observaciones: 'Paga a 30 días' },
];

describe('useProveedores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a GET /api/proveedores al montar y expone la lista', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProveedores });

    const { result } = renderHook(() => useProveedores());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(http.get).toHaveBeenCalledWith('/api/proveedores');
    expect(result.current.proveedores).toHaveLength(2);
  });

  it('create llama a POST /api/proveedores con el dto incluyendo cuit y observaciones', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProveedores });
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 3, name: 'Nuevo', cuit: '20-11111111-1', phone: null, email: null, observaciones: null } });

    const { result } = renderHook(() => useProveedores());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.create({ name: 'Nuevo', cuit: '20-11111111-1' });
    });

    expect(http.post).toHaveBeenCalledWith('/api/proveedores', expect.objectContaining({ name: 'Nuevo', cuit: '20-11111111-1' }));
  });

  it('update llama a PATCH /api/proveedores/:id con el dto correcto', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProveedores });
    (http.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { ...mockProveedores[0], name: 'Editado' } });

    const { result } = renderHook(() => useProveedores());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.update(1, { name: 'Editado' });
    });

    expect(http.patch).toHaveBeenCalledWith('/api/proveedores/1', expect.objectContaining({ name: 'Editado' }));
  });

  it('remove llama a DELETE /api/proveedores/:id y quita el proveedor de la lista', async () => {
    (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProveedores });
    (http.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const { result } = renderHook(() => useProveedores());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.remove(1);
    });

    expect(http.delete).toHaveBeenCalledWith('/api/proveedores/1');
    expect(result.current.proveedores).toHaveLength(1);
    expect(result.current.proveedores[0].id).toBe(2);
  });
});
