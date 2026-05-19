import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { CashMovement, type CashMovementType } from './entities/cash-movement.entity';
import { SalesService } from '../ventas/sales.service';

export interface CurrentMovementsResult {
  movements: CashMovement[];
  expectedBalance: number;
}

export interface PaymentBreakdown {
  cash: number;
  transfer: number;
  debit: number;
  credit: number;
}

export interface CloseSummaryResult {
  expectedBalance: number;
  paymentBreakdown: PaymentBreakdown;
}

@Injectable()
export class CajaService {
  constructor(
    @InjectRepository(CashRegister)
    private readonly registerRepo: Repository<CashRegister>,
    @InjectRepository(CashMovement)
    private readonly movementRepo: Repository<CashMovement>,
    @Inject(forwardRef(() => SalesService))
    private readonly salesService: SalesService,
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

  async getCurrentMovements(): Promise<CurrentMovementsResult> {
    const register = await this.registerRepo.findOne({ where: { status: 'open' } });
    if (!register) {
      throw new NotFoundException('No hay una caja abierta');
    }

    const movements = await this.movementRepo.find({ where: { cash_register_id: register.id } });

    const expectedBalance = movements.reduce((acc, m) => {
      if (m.type === 'income') return acc + Number(m.amount);
      return acc - Number(m.amount);
    }, Number(register.opening_amount));

    return { movements, expectedBalance };
  }

  async getCloseSummary(): Promise<CloseSummaryResult> {
    const register = await this.registerRepo.findOne({ where: { status: 'open' } });
    if (!register) {
      throw new NotFoundException('No hay una caja abierta');
    }

    const movements = await this.movementRepo.find({ where: { cash_register_id: register.id } });

    const expectedBalance = movements.reduce((acc, m) => {
      if (m.type === 'income') return acc + Number(m.amount);
      return acc - Number(m.amount);
    }, Number(register.opening_amount));

    const sales = await this.salesService.findConfirmedSince(register.opened_at);

    const paymentBreakdown: PaymentBreakdown = { cash: 0, transfer: 0, debit: 0, credit: 0 };
    for (const sale of sales) {
      paymentBreakdown[sale.payment_method] += Number(sale.total);
    }

    return { expectedBalance, paymentBreakdown };
  }
}
