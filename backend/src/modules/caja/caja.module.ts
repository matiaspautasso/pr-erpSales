import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { CashMovement } from './entities/cash-movement.entity';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CashRegister, CashMovement])],
  controllers: [CajaController],
  providers: [CajaService],
  exports: [CajaService],
})
export class CajaModule {}
