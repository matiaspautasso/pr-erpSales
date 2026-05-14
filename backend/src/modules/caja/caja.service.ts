import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { CashMovement, type CashMovementType } from './entities/cash-movement.entity';

@Injectable()
export class CajaService {
  constructor(
    @InjectRepository(CashRegister)
    private readonly registerRepo: Repository<CashRegister>,
    @InjectRepository(CashMovement)
    private readonly movementRepo: Repository<CashMovement>,
  ) {}

  async open(opening_amount: number): Promise<CashRegister> {
    const existing = await this.registerRepo.findOne({ where: { status: 'open' } });
    if (existing) {
      throw new BadRequestException('Ya hay una caja abierta');
    }
    return this.registerRepo.save({ opening_amount, status: 'open', closed_at: null });
  }

  async close(real_amount: number): Promise<CashRegister> {
    const register = await this.registerRepo.findOne({ where: { status: 'open' } });
    if (!register) {
      throw new NotFoundException('No hay una caja abierta');
    }

    const movements = await this.movementRepo.find({ where: { cash_register_id: register.id } });

    const expectedCash = movements.reduce((acc, m) => {
      if (m.type === 'income') return acc + Number(m.amount);
      return acc - Number(m.amount);
    }, Number(register.opening_amount));

    const difference = real_amount - expectedCash;

    return this.registerRepo.save({
      ...register,
      real_amount,
      closing_amount: expectedCash,
      difference,
      status: 'closed',
      closed_at: new Date(),
    });
  }

  async getCurrent(): Promise<CashRegister | null> {
    return this.registerRepo.findOne({ where: { status: 'open' } });
  }

  async getHistory(): Promise<CashRegister[]> {
    return this.registerRepo.find({ where: { status: 'closed' }, order: { opened_at: 'DESC' } });
  }

  async registerMovement(
    type: CashMovementType,
    amount: number,
    description?: string,
  ): Promise<void> {
    const register = await this.registerRepo.findOne({ where: { status: 'open' } });
    if (!register) {
      throw new NotFoundException('No hay una caja abierta');
    }
    await this.movementRepo.save({ cash_register_id: register.id, type, amount, description: description ?? null });
  }
}
