import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProveedoresService } from './proveedores.service';
import { Proveedor } from './entities/proveedor.entity';

describe('ProveedoresService', () => {
  let service: ProveedoresService;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProveedoresService,
        { provide: getRepositoryToken(Proveedor), useValue: repo },
      ],
    }).compile();

    service = module.get<ProveedoresService>(ProveedoresService);
  });

  it('crea un proveedor', async () => {
    repo.save.mockResolvedValue({ id: 1, name: 'Proveedor A', phone: null, email: null });
    const result = await service.create({ name: 'Proveedor A' });
    expect(result.name).toBe('Proveedor A');
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Proveedor A' }));
  });

  it('retorna todos los proveedores', async () => {
    repo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.findAll();
    expect(result).toHaveLength(2);
  });

  it('lanza NotFoundException cuando no existe el proveedor', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });
});
