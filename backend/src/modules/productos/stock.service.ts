import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementType } from './entities/stock-movement-type.enum';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
  ) {}

  async adjust(
    productId: number,
    type: StockMovementType,
    quantity: number,
    reason: string,
  ): Promise<void> {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('El motivo es obligatorio para ajustes manuales');
    }

    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Producto ${productId} no encontrado`);
    }

    const delta = type === StockMovementType.AJUSTE_POSITIVO ? quantity : -quantity;
    product.current_stock = Number(product.current_stock) + delta;

    await this.productRepo.save(product);
    await this.movementRepo.save({ product_id: productId, type, quantity, reason });
  }

  async registerMovement(
    productId: number,
    type: StockMovementType,
    quantity: number,
    reason?: string,
  ): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Produto ${productId} no encontrado`);
    }

    const delta = type === StockMovementType.SALIDA ? -quantity : quantity;
    product.current_stock = Number(product.current_stock) + delta;

    await this.productRepo.save(product);
    await this.movementRepo.save({ product_id: productId, type, quantity, reason });
  }

  async getBelowMinStock(): Promise<Product[]> {
    const products = await this.productRepo.find();
    return products.filter((p) => p.current_stock < p.min_stock);
  }
}
