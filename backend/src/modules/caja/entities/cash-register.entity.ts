import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cash_registers')
export class CashRegister {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  opening_amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  closing_amount!: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  real_amount!: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  difference!: number | null;

  @Column({ type: 'varchar', length: 6, default: 'open' })
  status!: 'open' | 'closed';

  @CreateDateColumn()
  opened_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at!: Date | null;
}
