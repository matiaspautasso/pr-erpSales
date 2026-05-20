import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { ProductosModule } from '../productos/productos.module';
import { CajaModule } from '../caja/caja.module';
import { Product } from '../productos/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem, Product]),
    ProductosModule,
    forwardRef(() => CajaModule),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class VentasModule {}
