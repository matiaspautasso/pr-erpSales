import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../productos/entities/product.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CajaModule } from '../caja/caja.module';
import { VentasModule } from '../ventas/ventas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CajaModule, VentasModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
