import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @IsInt()
  @IsPositive()
  producto_id!: number;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsNumber()
  @IsPositive()
  unit_price!: number;
}

export class CreateSaleDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items!: SaleItemDto[];

  @IsIn(['cash', 'transfer', 'debit', 'credit'])
  payment_method!: 'cash' | 'transfer' | 'debit' | 'credit';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percent?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
