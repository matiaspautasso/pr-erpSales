import { IsString, IsNotEmpty, IsIn, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsIn(['kg', 'unit'], { message: 'unit_of_sale debe ser "kg" o "unit"' })
  unit_of_sale!: 'kg' | 'unit';

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  @IsPositive()
  cost!: number;

  @IsNumber()
  @Min(0)
  current_stock!: number;

  @IsNumber()
  @Min(0)
  min_stock!: number;
}
