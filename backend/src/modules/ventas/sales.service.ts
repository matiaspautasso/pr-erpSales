import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Product } from '../productos/entities/product.entity';
import { StockService } from '../productos/stock.service';
import { CajaService } from '../caja/caja.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { StockMovementType } from '../productos/entities/stock-movement-type.enum';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly stockService: StockService,
    private readonly cajaService: CajaService,
  ) {}

  async create(dto: CreateSaleDto): Promise<Sale> {
    const caja = await this.cajaService.getCurrent();
    if (!caja) {
      throw new BadRequestException('No hay una caja abierta para registrar la venta');
    }

    let subtotalsSum = 0;
    for (const item of dto.items) {
      const product = await this.productRepo.findOne({ where: { id: item.producto_id } });
      if (!product) {
        throw new BadRequestException(`Producto ${item.producto_id} no encontrado`);
      }
      if (Number(product.current_stock) < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${item.producto_id}: disponible ${product.current_stock}, solicitado ${item.quantity}`,
        );
      }
      subtotalsSum += item.quantity * item.unit_price;
    }

    const discountPercent = dto.discount_percent ?? 0;
    const total = Math.round(subtotalsSum * (1 - discountPercent / 100) * 100) / 100;

    const items = dto.items.map((item) => ({
      producto_id: item.producto_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    const sale = await this.saleRepo.save({ total, discount_percent: discountPercent, status: 'confirmed', payment_method: dto.payment_method, notes: dto.notes ?? null, items });

    for (const item of dto.items) {
      await this.stockService.registerMovement(
        item.producto_id,
        StockMovementType.SALIDA,
        item.quantity,
        `Venta #${sale.id}`,
      );
    }

    await this.cajaService.registerMovement('income', total, `Venta #${sale.id}`);

    return sale;
  }

  async findAll(): Promise<Sale[]> {
    return this.saleRepo.find({ order: { created_at: 'DESC' } });
  }

  async findConfirmedSince(since: Date): Promise<Sale[]> {
    return this.saleRepo
      .createQueryBuilder('sale')
      .where('sale.status = :status', { status: 'confirmed' })
      .andWhere('sale.created_at >= :since', { since })
      .orderBy('sale.created_at', 'DESC')
      .getMany();
  }

  async cancel(id: number): Promise<Sale> {
    const sale = await this.saleRepo.findOne({ where: { id }, relations: ['items'] });
    if (!sale) {
      throw new BadRequestException(`Venta ${id} no encontrada`);
    }
    if (sale.status === 'cancelled') {
      throw new BadRequestException(`La venta ${id} ya está cancelada`);
    }

    for (const item of sale.items) {
      await this.stockService.registerMovement(
        item.producto_id,
        StockMovementType.ANULACION_VENTA,
        Number(item.quantity),
        `Anulación venta #${id}`,
      );
    }

    await this.cajaService.registerMovement('expense', Number(sale.total), `Anulación venta #${id}`);

    return this.saleRepo.save({ ...sale, status: 'cancelled' });
  }
}
