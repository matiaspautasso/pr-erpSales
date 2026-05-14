import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Compra } from './entities/compra.entity';
import { StockService } from '../productos/stock.service';
import { StockMovementType } from '../productos/entities/stock-movement-type.enum';
import { CreateCompraDto } from './dto/create-compra.dto';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
    @InjectRepository(Compra)
    private readonly compraRepo: Repository<Compra>,
    private readonly stockService: StockService,
  ) {}

  async create(dto: CreateCompraDto): Promise<Compra> {
    if (dto.quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const proveedor = await this.proveedorRepo.findOne({ where: { id: dto.proveedor_id } });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor ${dto.proveedor_id} no encontrado`);
    }

    const total = Number(dto.quantity) * Number(dto.unit_cost);
    const compra = await this.compraRepo.save({ ...dto, notes: dto.notes ?? null, total });

    await this.stockService.registerMovement(
      dto.producto_id,
      StockMovementType.ENTRADA,
      dto.quantity,
      `Compra #${compra.id} — ${proveedor.name}`,
    );

    return compra;
  }

  async findAll(): Promise<Compra[]> {
    return this.compraRepo.find({ relations: ['proveedor', 'producto'] });
  }

  async findOne(id: number): Promise<Compra> {
    const compra = await this.compraRepo.findOne({ where: { id }, relations: ['proveedor', 'producto'] });
    if (!compra) {
      throw new NotFoundException(`Compra ${id} no encontrada`);
    }
    return compra;
  }
}
