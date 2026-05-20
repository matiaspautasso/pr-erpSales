import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProveedoresService } from './proveedores.service';
import { Proveedor } from './entities/proveedor.entity';
import { Compra } from './entities/compra.entity';

describe('ProveedoresService', () => {
  let service: ProveedoresService;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock; update: jest.Mock; delete: jest.Mock };
  let compraRepo: { find: jest.Mock };

  beforeEach(async () => {
    repo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn() };
    compraRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProveedoresService,
        { provide: getRepositoryToken(Proveedor), useValue: repo },
        { provide: getRepositoryToken(Compra), useValue: compraRepo },
      ],
    }).compile();

    service = module.get<ProveedoresService>(ProveedoresService);
  });

  it('crea un proveedor', async () => {
    repo.save.mockResolvedValue({ id: 1, name: 'Proveedor A', phone: null, email: null, cuit: '20-12345678-9', observaciones: null });
    const result = await service.create({ name: 'Proveedor A', cuit: '20-12345678-9' });
    expect(result.name).toBe('Proveedor A');
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Proveedor A', cuit: '20-12345678-9' }));
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

  describe('update', () => {
    it('actualiza el proveedor y retorna el actualizado', async () => {
      const existing = { id: 1, name: 'Proveedor A', cuit: '20-12345678-9', observaciones: null };
      const updated = { ...existing, name: 'Proveedor B', observaciones: 'Paga a 30 días' };
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue(updated);
      const result = await service.update(1, { name: 'Proveedor B', observaciones: 'Paga a 30 días' });
      expect(result.name).toBe('Proveedor B');
      expect(result.observaciones).toBe('Paga a 30 días');
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Proveedor B' }));
    });

    it('lanza NotFoundException cuando el proveedor a actualizar no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(99, { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('elimina el proveedor correctamente', async () => {
      repo.findOne.mockResolvedValue({ id: 1, name: 'Proveedor A' });
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('lanza NotFoundException cuando el proveedor a eliminar no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findComprasByProveedor', () => {
    it('retorna solo las compras del proveedor indicado', async () => {
      repo.findOne.mockResolvedValue({ id: 1, name: 'Proveedor A' });
      compraRepo.find.mockResolvedValue([{ id: 10, proveedor_id: 1 }]);
      const result = await service.findComprasByProveedor(1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(10);
      expect(compraRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { proveedor_id: 1 } }));
    });

    it('lanza NotFoundException cuando el proveedor no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findComprasByProveedor(99)).rejects.toThrow(NotFoundException);
    });
  });
});
