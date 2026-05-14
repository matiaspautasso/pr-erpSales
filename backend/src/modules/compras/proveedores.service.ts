import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly repo: Repository<Proveedor>,
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
}
