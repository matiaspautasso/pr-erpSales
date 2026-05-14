import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { StockMovementType } from './stock-movement-type.enum';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  product_id!: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'varchar' })
  type!: StockMovementType;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  reason!: string | null;

  @Column({ type: 'integer', nullable: true })
  origin_id!: number | null;

  @CreateDateColumn()
  created_at!: Date;
}
