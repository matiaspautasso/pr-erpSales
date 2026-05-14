import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CashRegister } from './cash-register.entity';

export type CashMovementType = 'income' | 'expense' | 'withdrawal';

@Entity('cash_movements')
export class CashMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cash_register_id!: number;

  @Column({ type: 'varchar', length: 12 })
  type!: CashMovementType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => CashRegister)
  @JoinColumn({ name: 'cash_register_id' })
  cash_register!: CashRegister;
}
