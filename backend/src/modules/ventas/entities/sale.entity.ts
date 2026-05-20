import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total!: number;

  @Column({ type: 'varchar', length: 10, default: 'confirmed' })
  status!: 'confirmed' | 'cancelled';

  @Column({ type: 'varchar', length: 10 })
  payment_method!: 'cash' | 'transfer' | 'debit' | 'credit';

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percent!: number;

  @Column({ type: 'varchar', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items!: SaleItem[];
}
