import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CajaView } from './CajaView';
import type { CashRegister, CashMovement, CloseSummary } from './useCaja';

// CajaView es un componente PRESENTACIONAL — recibe todo via props, sin hooks de negocio.
// Estos tests verifican el contrato de props sin montar hooks ni hacer http.

const defaultProps = {
  current: null,
  history: [] as CashRegister[],
  currentMovements: [] as CashMovement[],
  expectedBalance: null as number | null,
  closeSummary: null as CloseSummary | null,
  loading: false,
  error: null,
  onOpen: vi.fn(),
  onClose: vi.fn(),
  onRegisterMovement: vi.fn(),
};

describe('CajaView — historial de cajas cerradas', () => {
  it('muestra la lista de cajas cerradas cuando history tiene items', () => {
    const history: CashRegister[] = [
      {
        id: 1,
        opening_amount: 1000,
        closing_amount: 1200,
        real_amount: 1150,
        difference: -50,
        status: 'closed',
        opened_at: '2024-01-15T08:00:00.000Z',
        closed_at: '2024-01-15T18:00:00.000Z',
      },
      {
        id: 2,
        opening_amount: 500,
        closing_amount: 800,
        real_amount: 800,
        difference: 0,
        status: 'closed',
        opened_at: '2024-01-14T08:00:00.000Z',
        closed_at: '2024-01-14T18:00:00.000Z',
      },
    ];

    render(<CajaView {...defaultProps} history={history} />);

    // Verifica apertura de la primera caja
    expect(screen.getByText('$1.000')).toBeInTheDocument();
    // Verifica cierre de la primera caja
    expect(screen.getByText('$1.200')).toBeInTheDocument();
  });

  it('muestra la diferencia negativa de una caja cerrada', () => {
    const history: CashRegister[] = [
      {
        id: 1,
        opening_amount: 1000,
        closing_amount: 1200,
        real_amount: 1150,
        difference: -50,
        status: 'closed',
        opened_at: '2024-01-15T08:00:00.000Z',
        closed_at: '2024-01-15T18:00:00.000Z',
      },
    ];

    render(<CajaView {...defaultProps} history={history} />);

    expect(screen.getByText('-$50')).toBeInTheDocument();
  });

  it('no muestra la sección de historial cuando history está vacío', () => {
    render(<CajaView {...defaultProps} history={[]} />);

    expect(screen.queryByText('Historial de cajas')).not.toBeInTheDocument();
  });
});

describe('CajaView — registrar egreso/retiro manual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario de movimiento cuando hay una caja abierta', () => {
    const current: CashRegister = {
      id: 1,
      opening_amount: 1000,
      closing_amount: null,
      real_amount: null,
      difference: null,
      status: 'open',
      opened_at: '2024-01-15T08:00:00.000Z',
      closed_at: null,
    };

    render(<CajaView {...defaultProps} current={current} />);

    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/concepto/i)).toBeInTheDocument();
  });

  it('llama a onRegisterMovement con type expense, amount y description al enviar el formulario', async () => {
    const user = userEvent.setup();
    const onRegisterMovement = vi.fn().mockResolvedValue(undefined);
    const current: CashRegister = {
      id: 1,
      opening_amount: 1000,
      closing_amount: null,
      real_amount: null,
      difference: null,
      status: 'open',
      opened_at: '2024-01-15T08:00:00.000Z',
      closed_at: null,
    };

    render(<CajaView {...defaultProps} current={current} onRegisterMovement={onRegisterMovement} />);

    await user.type(screen.getByLabelText(/monto/i), '200');
    await user.type(screen.getByLabelText(/concepto/i), 'Compra mercadería');

    // Seleccionar tipo egreso (debe ser el default o seleccionarlo explícitamente)
    const tipoSelect = screen.getByLabelText(/tipo/i);
    await user.selectOptions(tipoSelect, 'expense');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /registrar/i }));
    });

    await waitFor(() => {
      expect(onRegisterMovement).toHaveBeenCalledWith('expense', 200, 'Compra mercadería');
    });
  });

  it('llama a onRegisterMovement con type withdrawal al seleccionar retiro', async () => {
    const user = userEvent.setup();
    const onRegisterMovement = vi.fn().mockResolvedValue(undefined);
    const current: CashRegister = {
      id: 1,
      opening_amount: 1000,
      closing_amount: null,
      real_amount: null,
      difference: null,
      status: 'open',
      opened_at: '2024-01-15T08:00:00.000Z',
      closed_at: null,
    };

    render(<CajaView {...defaultProps} current={current} onRegisterMovement={onRegisterMovement} />);

    await user.type(screen.getByLabelText(/monto/i), '500');
    await user.type(screen.getByLabelText(/concepto/i), 'Retiro para gastos');
    await user.selectOptions(screen.getByLabelText(/tipo/i), 'withdrawal');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /registrar/i }));
    });

    await waitFor(() => {
      expect(onRegisterMovement).toHaveBeenCalledWith('withdrawal', 500, 'Retiro para gastos');
    });
  });

  it('no llama a onRegisterMovement si el monto es 0', async () => {
    const user = userEvent.setup();
    const onRegisterMovement = vi.fn();
    const current: CashRegister = {
      id: 1,
      opening_amount: 1000,
      closing_amount: null,
      real_amount: null,
      difference: null,
      status: 'open',
      opened_at: '2024-01-15T08:00:00.000Z',
      closed_at: null,
    };

    render(<CajaView {...defaultProps} current={current} onRegisterMovement={onRegisterMovement} />);

    await user.type(screen.getByLabelText(/concepto/i), 'Compra mercadería');
    // No completar monto — deja el valor vacío/inválido
    await user.click(screen.getByRole('button', { name: /registrar/i }));

    expect(onRegisterMovement).not.toHaveBeenCalled();
  });

  it('no llama a onRegisterMovement si el concepto está vacío', async () => {
    const user = userEvent.setup();
    const onRegisterMovement = vi.fn();
    const current: CashRegister = {
      id: 1,
      opening_amount: 1000,
      closing_amount: null,
      real_amount: null,
      difference: null,
      status: 'open',
      opened_at: '2024-01-15T08:00:00.000Z',
      closed_at: null,
    };

    render(<CajaView {...defaultProps} current={current} onRegisterMovement={onRegisterMovement} />);

    await user.type(screen.getByLabelText(/monto/i), '100');
    // No completar concepto
    await user.click(screen.getByRole('button', { name: /registrar/i }));

    expect(onRegisterMovement).not.toHaveBeenCalled();
  });
});

describe('CajaView — movimientos de sesión activa y saldo esperado', () => {
  const currentOpen: CashRegister = {
    id: 1,
    opening_amount: 500,
    closing_amount: null,
    real_amount: null,
    difference: null,
    status: 'open',
    opened_at: '2024-01-15T08:00:00.000Z',
    closed_at: null,
  };

  it('muestra el saldo esperado cuando hay caja abierta', () => {
    render(
      <CajaView
        {...defaultProps}
        current={currentOpen}
        expectedBalance={700}
        currentMovements={[]}
      />,
    );

    expect(screen.getByText(/saldo esperado/i)).toBeInTheDocument();
    expect(screen.getByText('$700')).toBeInTheDocument();
  });

  it('muestra la lista de movimientos de la sesión con tipo, monto y descripción', () => {
    const movements: CashMovement[] = [
      { id: 1, type: 'income', amount: 300, description: 'Venta #1', created_at: '2024-01-15T09:00:00Z', cash_register_id: 1 },
      { id: 2, type: 'expense', amount: 100, description: 'Compra insumos', created_at: '2024-01-15T10:00:00Z', cash_register_id: 1 },
    ];

    render(
      <CajaView
        {...defaultProps}
        current={currentOpen}
        expectedBalance={700}
        currentMovements={movements}
      />,
    );

    expect(screen.getByText('Venta #1')).toBeInTheDocument();
    expect(screen.getByText('Compra insumos')).toBeInTheDocument();
  });

  it('no muestra la sección de movimientos si no hay caja abierta', () => {
    render(
      <CajaView
        {...defaultProps}
        current={null}
        expectedBalance={null}
        currentMovements={[]}
      />,
    );

    expect(screen.queryByText(/saldo esperado/i)).not.toBeInTheDocument();
  });
});

describe('CajaView — resumen de cierre por medio de pago', () => {
  it('muestra el desglose por medio de pago en el modal de cierre después de cerrar', async () => {
    const user = userEvent.setup();
    const closedRegister: CashRegister = {
      id: 1,
      opening_amount: 500,
      closing_amount: 1500,
      real_amount: 1400,
      difference: -100,
      status: 'closed',
      opened_at: '2024-01-15T08:00:00.000Z',
      closed_at: '2024-01-15T18:00:00.000Z',
    };

    const summary: CloseSummary = {
      expectedBalance: 1500,
      paymentBreakdown: { cash: 1300, transfer: 200, debit: 0, credit: 0 },
    };

    const onClose = vi.fn().mockResolvedValue(closedRegister);

    const currentOpen: CashRegister = {
      id: 1,
      opening_amount: 500,
      closing_amount: null,
      real_amount: null,
      difference: null,
      status: 'open',
      opened_at: '2024-01-15T08:00:00.000Z',
      closed_at: null,
    };

    render(
      <CajaView
        {...defaultProps}
        current={currentOpen}
        closeSummary={summary}
        onClose={onClose}
      />,
    );

    // Abrir el modal de cierre (botón en la tarjeta de caja abierta)
    await user.click(screen.getByRole('button', { name: /cerrar caja/i }));

    // Ingresar monto real (ahora el modal está visible)
    await user.type(screen.getByLabelText(/monto real/i), '1400');

    await act(async () => {
      // Hay dos botones "Cerrar caja": el de la tarjeta (oculto detrás del modal) y el submit del form.
      // Tomamos el último (el submit dentro del modal).
      const buttons = screen.getAllByRole('button', { name: /cerrar caja/i });
      await user.click(buttons[buttons.length - 1]);
    });

    await waitFor(() => {
      // El modal de resultado debe mostrar el desglose por medio de pago
      expect(screen.getByText(/efectivo/i)).toBeInTheDocument();
      expect(screen.getByText(/transferencia/i)).toBeInTheDocument();
    });
  });
});
