import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { StockService } from './stock.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('productos')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly stockService: StockService,
  ) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('stock/low')
  getBelowMinStock() {
    return this.stockService.getBelowMinStock();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Post(':id/stock/adjust')
  adjust(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustStockDto) {
    return this.stockService.adjust(id, dto.type, dto.quantity, dto.reason);
  }
}
