import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
