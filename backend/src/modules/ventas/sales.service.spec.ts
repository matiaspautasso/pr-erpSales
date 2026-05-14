import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../productos/entities/product.entity';
import { StockService } from '../productos/stock.service';
import { CajaService } from '../caja/caja.service';
import { StockMovementType } from '../productos/entities/stock-movement-type.enum';

describe('SalesService', () => {
  let service: SalesService;
  let saleRepo: { save: jest.Mock; find: jest.Mock };
  let productRepo: { findOne: jest.Mock };
  let stockService: { registerMovement: jest.Mock };
  let cajaService: { getCurrent: jest.Mock; registerMovement: jest.Mock };

  beforeEach(async () => {
    saleRepo = { save: jest.fn(), find: jest.fn() };
    productRepo = { findOne: jest.fn() };
    stockService = { registerMovement: jest.fn().mockResolvedValue(undefined) };
    cajaService = {
      getCurrent: jest.fn(),
      registerMovement: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getRepositoryToken(Sale), useValue: saleRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: StockService, useValue: stockService },
        { provide: CajaService, useValue: cajaService },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  const baseItem = { producto_id: 1, quantity: 2, unit_price: 500 };
  const dto = { items: [baseItem] };

  describe('create', () => {
    it('lanza BadRequestException si no hay caja abierta', async () => {
      cajaService.getCurrent.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el stock es insuficiente para algún item', async () => {
      cajaService.getCurrent.mockResolvedValue({ id: 1, status: 'open' });
      productRepo.findOne.mockResolvedValue({ id: 1, current_stock: '1.000', price: 500 });

      await expect(service.create({ items: [{ producto_id: 1, quantity: 5, unit_price: 500 }] })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('guarda la venta, descuenta stock con SALIDA y registra ingreso en caja', async () => {
      cajaService.getCurrent.mockResolvedValue({ id: 1, status: 'open' });
      productRepo.findOne.mockResolvedValue({ id: 1, current_stock: '10.000', price: 500 });
      saleRepo.save.mockResolvedValue({ id: 7, total: 1000, status: 'confirmed' });

      const result = await service.create(dto);

      expect(saleRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ total: 1000, status: 'confirmed' }),
      );
      expect(stockService.registerMovement).toHaveBeenCalledWith(
        1,
        StockMovementType.SALIDA,
        2,
        expect.stringContaining('7'),
      );
      expect(cajaService.registerMovement).toHaveBeenCalledWith('income', 1000, expect.any(String));
      expect(result.id).toBe(7);
    });
  });

  describe('findAll', () => {
    it('retorna todas las ventas', async () => {
      saleRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });
});
