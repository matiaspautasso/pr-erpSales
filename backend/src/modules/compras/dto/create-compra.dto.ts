import { IsInt, IsPositive, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';

export class CreateCompraDto {
  @IsInt()
  @IsPositive()
  proveedor_id!: number;

  @IsInt()
  @IsPositive()
  producto_id!: number;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsNumber()
  @IsPositive()
  unit_cost!: number;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
