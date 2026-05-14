import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { StockService } from '../productos/stock.service';
import { Proveedor } from './entities/proveedor.entity';
import { Compra } from './entities/compra.entity';
import { StockMovementType } from '../productos/entities/stock-movement-type.enum';

describe('ComprasService', () => {
  let service: ComprasService;
  let proveedorRepo: { findOne: jest.Mock };
  let compraRepo: { save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let stockService: { registerMovement: jest.Mock };

  beforeEach(async () => {
    proveedorRepo = { findOne: jest.fn() };
    compraRepo = { save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
    stockService = { registerMovement: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComprasService,
        { provide: getRepositoryToken(Proveedor), useValue: proveedorRepo },
        { provide: getRepositoryToken(Compra), useValue: compraRepo },
        { provide: StockService, useValue: stockService },
      ],
    }).compile();

    service = module.get<ComprasService>(ComprasService);
  });

  describe('create', () => {
    const dto = {
      proveedor_id: 1,
      producto_id: 2,
      quantity: 3,
      unit_cost: 500,
      date: '2026-05-13',
    };

    it('lanza NotFoundException cuando el proveedor no existe', async () => {
      proveedorRepo.findOne.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('guarda la compra y llama a registerMovement con ENTRADA', async () => {
      proveedorRepo.findOne.mockResolvedValue({ id: 1, name: 'Proveedor A' });
      compraRepo.save.mockResolvedValue({ id: 10, ...dto, total: 1500 });

      await service.create(dto);

      expect(compraRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ proveedor_id: 1, producto_id: 2, quantity: 3, total: 1500 }),
      );
      expect(stockService.registerMovement).toHaveBeenCalledWith(
        2,
        StockMovementType.ENTRADA,
        3,
        expect.stringContaining('10'),
      );
    });

    it('lanza BadRequestException cuando quantity es 0', async () => {
      proveedorRepo.findOne.mockResolvedValue({ id: 1, name: 'Proveedor A' });
      await expect(service.create({ ...dto, quantity: 0 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('retorna todas las compras', async () => {
      compraRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });
});
