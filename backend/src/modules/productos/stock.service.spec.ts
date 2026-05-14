import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { Product } from './entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementType } from './entities/stock-movement-type.enum';

describe('StockService', () => {
  let service: StockService;
  let productRepo: { findOne: jest.Mock; save: jest.Mock; find: jest.Mock };
  let movementRepo: { save: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    productRepo = { findOne: jest.fn(), save: jest.fn(), find: jest.fn() };
    movementRepo = { save: jest.fn(), find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(StockMovement), useValue: movementRepo },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  describe('adjust', () => {
    it('lanza BadRequestException cuando el motivo está vacío', async () => {
      await expect(
        service.adjust(1, StockMovementType.AJUSTE_POSITIVO, 1.5, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException cuando el producto no existe', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(
        service.adjust(99, StockMovementType.AJUSTE_POSITIVO, 1.5, 'Merma'),
      ).rejects.toThrow(NotFoundException);
    });

    it('aumenta el stock con AJUSTE_POSITIVO', async () => {
      productRepo.findOne.mockResolvedValue({ id: 1, current_stock: 5, unit_of_sale: 'kg' });
      productRepo.save.mockResolvedValue({});
      movementRepo.save.mockResolvedValue({});

      await service.adjust(1, StockMovementType.AJUSTE_POSITIVO, 2.5, 'Error de carga');

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ current_stock: 7.5 }),
      );
    });

    it('disminuye el stock con AJUSTE_NEGATIVO', async () => {
      productRepo.findOne.mockResolvedValue({ id: 1, current_stock: 5, unit_of_sale: 'kg' });
      productRepo.save.mockResolvedValue({});
      movementRepo.save.mockResolvedValue({});

      await service.adjust(1, StockMovementType.AJUSTE_NEGATIVO, 2, 'Merma');

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ current_stock: 3 }),
      );
    });
  });

  describe('registerMovement', () => {
    it('guarda el movimiento y actualiza el stock del producto', async () => {
      productRepo.findOne.mockResolvedValue({ id: 1, current_stock: 10, unit_of_sale: 'kg' });
      productRepo.save.mockResolvedValue({});
      movementRepo.save.mockResolvedValue({});

      await service.registerMovement(1, StockMovementType.SALIDA, 3);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ current_stock: 7 }),
      );
      expect(movementRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ type: StockMovementType.SALIDA, quantity: 3 }),
      );
    });
  });

  describe('getBelowMinStock', () => {
    it('retorna solo los productos con stock bajo mínimo', async () => {
      const products = [
        { id: 1, current_stock: 1, min_stock: 2 },
        { id: 2, current_stock: 5, min_stock: 3 },
      ];
      productRepo.find = jest.fn().mockResolvedValue(products);
      const result = await service.getBelowMinStock();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });
});
