import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { ProductsService } from './products.service';
import { StockService } from './stock.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockMovement])],
  controllers: [ProductsController],
  providers: [ProductsService, StockService],
  exports: [ProductsService, StockService],
})
export class ProductosModule {}
