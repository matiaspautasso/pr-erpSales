import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ProveedoresService } from './proveedores.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { CreateProveedorDto } from './dto/create-proveedor.dto';

@Controller()
export class ComprasController {
  constructor(
    private readonly comprasService: ComprasService,
    private readonly proveedoresService: ProveedoresService,
  ) {}

  @Post('proveedores')
  createProveedor(@Body() dto: CreateProveedorDto) {
    return this.proveedoresService.create(dto);
  }

  @Get('proveedores')
  findAllProveedores() {
    return this.proveedoresService.findAll();
  }

  @Get('proveedores/:id')
  findOneProveedor(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findOne(id);
  }

  @Post('compras')
  createCompra(@Body() dto: CreateCompraDto) {
    return this.comprasService.create(dto);
  }

  @Get('compras')
  findAllCompras() {
    return this.comprasService.findAll();
  }

  @Get('compras/:id')
  findOneCompra(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.findOne(id);
  }
}
