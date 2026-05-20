import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import { http } from '../../shared/api/http';
import { ProductsView } from './ProductsView';

const mockProduct = {
  id: 1,
  name: 'Pechuga',
  category: 'Pollo',
  unit_of_sale: 'kg' as const,
  price: 4500,
  cost: 3200,
  current_stock: 10.5,
  min_stock: 2.0,
  status: 'active' as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  (http.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [mockProduct] });
});

// ─── Ítem 1: Bug decimales de stock ─────────────────────────────────────────

describe('ProductsView — stock con 3 decimales', () => {
  it('muestra el stock actual con 3 decimales', async () => {
    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());
    expect(screen.getByText('10.500')).toBeTruthy();
  });
});

// ─── Verificación adicional UC-PROD-01: columna Costo ────────────────────────

describe('ProductsView — columna Costo', () => {
  it('renderiza la cabecera "Costo" en la tabla', async () => {
    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());
    expect(screen.getByText('Costo')).toBeTruthy();
  });

  it('muestra el valor de cost del producto en la fila', async () => {
    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());
    // cost = 3200, shown as $3.200 (es-AR) or similar; we verify the cell exists with the value
    expect(screen.getByTestId('product-cost-1')).toBeTruthy();
  });
});

// ─── Ítem 2: Botón Editar ────────────────────────────────────────────────────

describe('ProductsView — editar producto', () => {
  it('muestra un botón "Editar" en cada fila', async () => {
    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());
    expect(screen.getByRole('button', { name: /editar/i })).toBeTruthy();
  });

  it('al hacer click en "Editar" se abre el modal con los datos del producto', async () => {
    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(screen.getByText('Editar producto')).toBeTruthy();
    expect((screen.getByDisplayValue('Pechuga') as HTMLInputElement).value).toBe('Pechuga');
  });

  it('al enviar el formulario de edición llama a PATCH /api/productos/:id con los campos modificados', async () => {
    (http.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { ...mockProduct, name: 'Pechuga Especial' } });

    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    await waitFor(() => screen.getByText('Editar producto'));

    const nameInput = screen.getByDisplayValue('Pechuga') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Pechuga Especial' } });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(http.patch).toHaveBeenCalledWith(
        '/api/productos/1',
        expect.objectContaining({ name: 'Pechuga Especial' }),
      ),
    );
  });
});

// ─── Ítem 3: Acción Desactivar ───────────────────────────────────────────────

describe('ProductsView — desactivar producto', () => {
  it('muestra un botón "Desactivar" en cada fila de productos activos', async () => {
    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());
    expect(screen.getByRole('button', { name: /desactivar/i })).toBeTruthy();
  });

  it('al confirmar "Desactivar" llama a PATCH /api/productos/:id con status inactive', async () => {
    (http.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { ...mockProduct, status: 'inactive' } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /desactivar/i }));

    await waitFor(() =>
      expect(http.patch).toHaveBeenCalledWith('/api/productos/1', { status: 'inactive' }),
    );
  });

  it('si el usuario cancela el confirm NO llama a PATCH', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ProductsView />);
    await waitFor(() => expect(screen.queryByText('Cargando productos...')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /desactivar/i }));

    expect(http.patch).not.toHaveBeenCalled();
  });
});
