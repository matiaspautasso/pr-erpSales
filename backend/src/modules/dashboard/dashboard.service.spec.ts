import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { Product } from '../productos/entities/product.entity';
import { CajaService } from '../caja/caja.service';
import { SalesService } from '../ventas/sales.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let productRepo: { count: jest.Mock; find: jest.Mock };
  let cajaService: { getCurrent: jest.Mock };
  let salesService: { findAll: jest.Mock };

  beforeEach(async () => {
    productRepo = { count: jest.fn(), find: jest.fn() };
    cajaService = { getCurrent: jest.fn().mockResolvedValue(null) };
    salesService = { findAll: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: CajaService, useValue: cajaService },
        { provide: SalesService, useValue: salesService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getKPIs', () => {
    it('retorna total_productos con el conteo de productos activos', async () => {
      productRepo.count.mockResolvedValue(12);
      productRepo.find.mockResolvedValue([]);

      const result = await service.getKPIs();

      expect(productRepo.count).toHaveBeenCalledWith({ where: { status: 'active' } });
      expect(result.total_productos).toBe(12);
    });

    it('retorna productos_bajo_minimo con la cantidad de productos con stock bajo', async () => {
      productRepo.count.mockResolvedValue(5);
      productRepo.find.mockResolvedValue([
        { id: 1, current_stock: 1, min_stock: 3 },
        { id: 2, current_stock: 5, min_stock: 2 },
        { id: 3, current_stock: 0, min_stock: 1 },
      ]);

      const result = await service.getKPIs();

      expect(result.productos_bajo_minimo).toBe(2);
    });

    it('retorna estado_caja cerrada cuando no hay caja abierta', async () => {
      productRepo.count.mockResolvedValue(0);
      productRepo.find.mockResolvedValue([]);
      cajaService.getCurrent.mockResolvedValue(null);

      const result = await service.getKPIs();

      expect(result.ventas_hoy).toBe(0);
      expect(result.monto_ventas_hoy).toBe(0);
      expect(result.estado_caja).toBe('cerrada');
    });

    it('retorna estado_caja abierta cuando hay caja abierta', async () => {
      productRepo.count.mockResolvedValue(0);
      productRepo.find.mockResolvedValue([]);
      cajaService.getCurrent.mockResolvedValue({ id: 1, status: 'open' });

      const result = await service.getKPIs();

      expect(result.estado_caja).toBe('abierta');
    });

    it('retorna ventas_hoy y monto_ventas_hoy con ventas confirmadas de hoy', async () => {
      const today = new Date().toISOString();
      productRepo.count.mockResolvedValue(0);
      productRepo.find.mockResolvedValue([]);
      salesService.findAll.mockResolvedValue([
        { id: 1, total: '500.00', status: 'confirmed', created_at: today },
        { id: 2, total: '300.00', status: 'confirmed', created_at: today },
        { id: 3, total: '200.00', status: 'cancelled', created_at: today },
      ]);

      const result = await service.getKPIs();

      expect(result.ventas_hoy).toBe(2);
      expect(result.monto_ventas_hoy).toBe(800);
    });
  });
});
