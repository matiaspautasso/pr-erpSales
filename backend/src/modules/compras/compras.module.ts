import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Compra } from './entities/compra.entity';
import { ComprasService } from './compras.service';
import { ProveedoresService } from './proveedores.service';
import { ComprasController } from './compras.controller';
import { ProductosModule } from '../productos/productos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proveedor, Compra]),
    ProductosModule,
  ],
  controllers: [ComprasController],
  providers: [ComprasService, ProveedoresService],
})
export class ComprasModule {}
