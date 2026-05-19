import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Compra } from './entities/compra.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly repo: Repository<Proveedor>,
    @InjectRepository(Compra)
    private readonly compraRepo: Repository<Compra>,
  ) {}

  async create(dto: CreateProveedorDto): Promise<Proveedor> {
    return this.repo.save({ ...dto });
  }

  async findAll(): Promise<Proveedor[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.repo.findOne({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor ${id} no encontrado`);
    }
    return proveedor;
  }

  async update(id: number, dto: UpdateProveedorDto): Promise<Proveedor> {
    const proveedor = await this.repo.findOne({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor ${id} no encontrado`);
    }
    return this.repo.save({ ...proveedor, ...dto });
  }

  async remove(id: number): Promise<void> {
    const proveedor = await this.repo.findOne({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor ${id} no encontrado`);
    }
    await this.repo.delete(id);
  }

  async findComprasByProveedor(id: number): Promise<Compra[]> {
    const proveedor = await this.repo.findOne({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor ${id} no encontrado`);
    }
    return this.compraRepo.find({ where: { proveedor_id: id }, relations: ['producto'] });
  }
}
