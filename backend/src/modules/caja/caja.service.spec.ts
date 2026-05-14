import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CajaService } from './caja.service';
import { CashRegister } from './entities/cash-register.entity';
import { CashMovement } from './entities/cash-movement.entity';

describe('CajaService', () => {
  let service: CajaService;
  let registerRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock };
  let movementRepo: { find: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    registerRepo = { findOne: jest.fn(), find: jest.fn(), save: jest.fn() };
    movementRepo = { find: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CajaService,
        { provide: getRepositoryToken(CashRegister), useValue: registerRepo },
        { provide: getRepositoryToken(CashMovement), useValue: movementRepo },
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
});
