import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../productos/entities/product.entity';
import { CajaService } from '../caja/caja.service';
import { SalesService } from '../ventas/sales.service';

export interface DashboardKPIs {
  total_productos: number;
  productos_bajo_minimo: number;
  ventas_hoy: number;
  monto_ventas_hoy: number;
  estado_caja: 'abierta' | 'cerrada';
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly cajaService: CajaService,
    private readonly salesService: SalesService,
  ) {}

  async getKPIs(): Promise<DashboardKPIs> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total_productos, allProducts, currentCaja, allSales] = await Promise.all([
      this.productRepo.count({ where: { status: 'active' } }),
      this.productRepo.find(),
      this.cajaService.getCurrent(),
      this.salesService.findAll(),
    ]);

    const productos_bajo_minimo = allProducts.filter(
      (p) => Number(p.current_stock) < Number(p.min_stock),
    ).length;

    const todaySales = allSales.filter(
      (s) => s.status === 'confirmed' && new Date(s.created_at) >= todayStart,
    );

    return {
      total_productos,
      productos_bajo_minimo,
      ventas_hoy: todaySales.length,
      monto_ventas_hoy: todaySales.reduce((acc, s) => acc + Number(s.total), 0),
      estado_caja: currentCaja ? 'abierta' : 'cerrada',
    };
  }
}
