import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

const makeProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 1,
    name: 'Pechuga',
    category: 'Pollo',
    unit_of_sale: 'kg',
    price: 4500,
    cost: 3000,
    current_stock: 10,
    min_stock: 2,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as Product);

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: {
    count: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('create', () => {
    const dto: CreateProductDto = {
      name: 'Pechuga',
      category: 'Pollo',
      unit_of_sale: 'kg',
      price: 4500,
      cost: 3000,
      current_stock: 10,
      min_stock: 2,
    };

    it('lanza BadRequestException cuando ya existen 50 productos', async () => {
      repo.count.mockResolvedValue(50);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('solo cuenta productos activos para verificar el límite de 50', async () => {
      repo.count.mockResolvedValue(0);
      repo.save.mockResolvedValue(makeProduct());
      await service.create(dto);
      expect(repo.count).toHaveBeenCalledWith({ where: { status: 'active' } });
    });

    it('crea el producto cuando hay menos de 50', async () => {
      repo.count.mockResolvedValue(5);
      repo.save.mockResolvedValue(makeProduct());
      const result = await service.create(dto);
      expect(result.name).toBe('Pechuga');
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pechuga' }));
    });
  });

  describe('findAll', () => {
    it('retorna todos los productos', async () => {
      const products = [makeProduct(), makeProduct({ id: 2, name: 'Milanesa', unit_of_sale: 'unit' })];
      repo.find.mockResolvedValue(products);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('retorna el producto cuando existe', async () => {
      repo.findOne.mockResolvedValue(makeProduct());
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('lanza NotFoundException cuando no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('actualiza los campos permitidos del producto', async () => {
      repo.findOne.mockResolvedValue(makeProduct());
      repo.save.mockResolvedValue(makeProduct({ price: 5000 }));
      const result = await service.update(1, { price: 5000 });
      expect(result.price).toBe(5000);
    });
  });
});
