import { Body, Controller, Get, Post } from '@nestjs/common';
import { CajaService } from './caja.service';
import { IsNumber, IsPositive, IsOptional, IsString, IsIn, Min } from 'class-validator';
import { type CashMovementType } from './entities/cash-movement.entity';

class OpenCajaDto {
  @IsNumber()
  @IsPositive()
  opening_amount!: number;
}

class CloseCajaDto {
  @IsNumber()
  @Min(0)
  real_amount!: number;
}

class RegisterMovementDto {
  @IsIn(['income', 'expense', 'withdrawal'])
  type!: CashMovementType;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('open')
  open(@Body() dto: OpenCajaDto) {
    return this.cajaService.open(dto.opening_amount);
  }

  @Post('close')
  close(@Body() dto: CloseCajaDto) {
    return this.cajaService.close(dto.real_amount);
  }

  @Get('current')
  getCurrent() {
    return this.cajaService.getCurrent();
  }

  @Get('current/movements')
  getCurrentMovements() {
    return this.cajaService.getCurrentMovements();
  }

  @Get('current/summary')
  getCloseSummary() {
    return this.cajaService.getCloseSummary();
  }

  @Get('history')
  getHistory() {
    return this.cajaService.getHistory();
  }

  @Post('movements')
  registerMovement(@Body() dto: RegisterMovementDto) {
    return this.cajaService.registerMovement(dto.type, dto.amount, dto.description);
  }
}
