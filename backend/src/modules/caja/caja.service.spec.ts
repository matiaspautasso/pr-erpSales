import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNumber, Min, validate } from 'class-validator';
import { CajaService } from './caja.service';
import { CashRegister } from './entities/cash-register.entity';
import { CashMovement } from './entities/cash-movement.entity';
import { SalesService } from '../ventas/sales.service';

class CloseCajaDtoTestable {
  @IsNumber()
  @Min(0)
  real_amount!: number;
}

describe('CajaService', () => {
  let service: CajaService;
  let registerRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock };
  let movementRepo: { find: jest.Mock; save: jest.Mock };
  let salesService: { findConfirmedSince: jest.Mock };

  beforeEach(async () => {
    registerRepo = { findOne: jest.fn(), find: jest.fn(), save: jest.fn() };
    movementRepo = { find: jest.fn(), save: jest.fn() };
    salesService = { findConfirmedSince: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CajaService,
        { provide: getRepositoryToken(CashRegister), useValue: registerRepo },
        { provide: getRepositoryToken(CashMovement), useValue: movementRepo },
        { provide: SalesService, useValue: salesService },
      ],
    }).compile();

    service = module.get<CajaService>(CajaService);
  });

  describe('open', () => {
    it('lanza BadRequestException si ya hay una caja abierta', async () => {
      registerRepo.findOne.mockResolvedValue({ id: 1, status: 'open' });
      await expect(service.open(1000)).rejects.toThrow(BadRequestException);
    });

    it('crea la caja cuando no hay ninguna abierta', async () => {
      registerRepo.findOne.mockResolvedValue(null);
      registerRepo.save.mockResolvedValue({ id: 1, opening_amount: 1000, status: 'open' });

      const result = await service.open(1000);

      expect(registerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ opening_amount: 1000, status: 'open' }),
      );
      expect(result.status).toBe('open');
    });
  });

  describe('close', () => {
    it('lanza NotFoundException si no hay caja abierta', async () => {
      registerRepo.findOne.mockResolvedValue(null);
      await expect(service.close(500)).rejects.toThrow(NotFoundException);
    });

    it('calcula diferencia = monto_real - saldo_esperado_efectivo', async () => {
      const openRegister = { id: 1, opening_amount: 1000, status: 'open' };
      registerRepo.findOne.mockResolvedValue(openRegister);
      movementRepo.find.mockResolvedValue([
        { type: 'income', amount: 500 },
        { type: 'income', amount: 300 },
        { type: 'expense', amount: 200 },
        { type: 'withdrawal', amount: 100 },
      ]);
      registerRepo.save.mockResolvedValue({ ...openRegister, status: 'closed' });

      // expected = 1000 + 500 + 300 - 200 - 100 = 1500
      // real = 1400
      // difference = 1400 - 1500 = -100
      await service.close(1400);

      expect(registerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          real_amount: 1400,
          difference: -100,
          status: 'closed',
        }),
      );
    });
  });

  describe('getCurrent', () => {
    it('retorna la caja abierta actual', async () => {
      registerRepo.findOne.mockResolvedValue({ id: 1, status: 'open' });
      const result = await service.getCurrent();
      expect(result?.status).toBe('open');
    });

    it('retorna null si no hay caja abierta', async () => {
      registerRepo.findOne.mockResolvedValue(null);
      const result = await service.getCurrent();
      expect(result).toBeNull();
    });
  });

  describe('registerMovement', () => {
    it('guarda el movimiento en la caja abierta', async () => {
      registerRepo.findOne.mockResolvedValue({ id: 3, status: 'open' });
      movementRepo.save.mockResolvedValue({});

      await service.registerMovement('income', 500, 'Venta #1');

      expect(movementRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ cash_register_id: 3, type: 'income', amount: 500 }),
      );
    });

    it('lanza NotFoundException si no hay caja abierta al registrar movimiento', async () => {
      registerRepo.findOne.mockResolvedValue(null);
      await expect(service.registerMovement('income', 100, 'test')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurrentMovements', () => {
    it('lanza NotFoundException si no hay caja abierta', async () => {
      registerRepo.findOne.mockResolvedValue(null);
      await expect(service.getCurrentMovements()).rejects.toThrow(NotFoundException);
    });

    it('devuelve los movimientos y el saldo esperado de la caja abierta', async () => {
      const openRegister = { id: 2, opening_amount: 500, status: 'open' };
      registerRepo.findOne.mockResolvedValue(openRegister);
      movementRepo.find.mockResolvedValue([
        { id: 1, type: 'income', amount: 300, description: 'Venta #1', created_at: new Date('2024-01-15T09:00:00Z'), cash_register_id: 2 },
        { id: 2, type: 'expense', amount: 100, description: 'Compra', created_at: new Date('2024-01-15T10:00:00Z'), cash_register_id: 2 },
      ]);

      const result = await service.getCurrentMovements();

      // saldo = 500 + 300 - 100 = 700
      expect(result.expectedBalance).toBe(700);
      expect(result.movements).toHaveLength(2);
    });

    it('saldo esperado considera ingresos, egresos y retiros', async () => {
      const openRegister = { id: 3, opening_amount: 1000, status: 'open' };
      registerRepo.findOne.mockResolvedValue(openRegister);
      movementRepo.find.mockResolvedValue([
        { type: 'income', amount: 500 },
        { type: 'withdrawal', amount: 200 },
        { type: 'expense', amount: 50 },
      ]);

      const result = await service.getCurrentMovements();

      // 1000 + 500 - 200 - 50 = 1250
      expect(result.expectedBalance).toBe(1250);
    });
  });

  describe('getCloseSummary', () => {
    it('lanza NotFoundException si no hay caja abierta', async () => {
      registerRepo.findOne.mockResolvedValue(null);
      await expect(service.getCloseSummary()).rejects.toThrow(NotFoundException);
    });

    it('devuelve el desglose de ventas por medio de pago para la sesión activa', async () => {
      const openedAt = new Date('2024-01-15T08:00:00Z');
      const openRegister = { id: 5, opening_amount: 500, status: 'open', opened_at: openedAt };
      registerRepo.findOne.mockResolvedValue(openRegister);
      movementRepo.find.mockResolvedValue([]);
      salesService.findConfirmedSince.mockResolvedValue([
        { total: 1000, payment_method: 'cash' },
        { total: 500, payment_method: 'transfer' },
        { total: 300, payment_method: 'cash' },
        { total: 200, payment_method: 'debit' },
      ]);

      const result = await service.getCloseSummary();

      expect(salesService.findConfirmedSince).toHaveBeenCalledWith(openedAt);
      expect(result.paymentBreakdown.cash).toBe(1300);
      expect(result.paymentBreakdown.transfer).toBe(500);
      expect(result.paymentBreakdown.debit).toBe(200);
      expect(result.paymentBreakdown.credit).toBe(0);
    });

    it('incluye el saldo esperado en el resumen de cierre', async () => {
      const openedAt = new Date('2024-01-15T08:00:00Z');
      const openRegister = { id: 6, opening_amount: 1000, status: 'open', opened_at: openedAt };
      registerRepo.findOne.mockResolvedValue(openRegister);
      movementRepo.find.mockResolvedValue([
        { type: 'income', amount: 600 },
        { type: 'expense', amount: 100 },
      ]);
      salesService.findConfirmedSince.mockResolvedValue([]);

      const result = await service.getCloseSummary();

      // 1000 + 600 - 100 = 1500
      expect(result.expectedBalance).toBe(1500);
    });
  });
});

describe('CloseCajaDto', () => {
  it('acepta real_amount = 0 como válido (caja vacía)', async () => {
    const dto = Object.assign(new CloseCajaDtoTestable(), { real_amount: 0 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rechaza real_amount negativo', async () => {
    const dto = Object.assign(new CloseCajaDtoTestable(), { real_amount: -1 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
