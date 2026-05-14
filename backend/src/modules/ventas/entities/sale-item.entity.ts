import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../productos/entities/product.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sale_id!: number;

  @Column()
  producto_id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Sale, (sale) => sale.items)
  @JoinColumn({ name: 'sale_id' })
  sale!: Sale;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'producto_id' })
  producto!: Product;
}
