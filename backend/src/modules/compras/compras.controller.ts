import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ProveedoresService } from './proveedores.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

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

  @Patch('proveedores/:id')
  updateProveedor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProveedorDto) {
    return this.proveedoresService.update(id, dto);
  }

  @Delete('proveedores/:id')
  removeProveedor(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.remove(id);
  }

  @Get('proveedores/:id/compras')
  findComprasByProveedor(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findComprasByProveedor(id);
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
