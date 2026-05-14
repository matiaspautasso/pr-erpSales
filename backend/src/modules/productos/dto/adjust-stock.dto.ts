import { IsIn, IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
import { StockMovementType } from '../entities/stock-movement-type.enum';

const ADJUSTMENT_TYPES = [
  StockMovementType.AJUSTE_POSITIVO,
  StockMovementType.AJUSTE_NEGATIVO,
] as const;

export class AdjustStockDto {
  @IsIn(ADJUSTMENT_TYPES, { message: 'El tipo debe ser AJUSTE_POSITIVO o AJUSTE_NEGATIVO' })
  type!: (typeof ADJUSTMENT_TYPES)[number];

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsString()
  @IsNotEmpty({ message: 'El motivo es obligatorio para ajustes manuales' })
  reason!: string;
}
