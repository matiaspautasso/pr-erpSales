import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
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

  @IsOptional()
  @IsString()
  notes?: string;
}
