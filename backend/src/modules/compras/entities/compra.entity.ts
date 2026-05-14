import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proveedor } from './proveedor.entity';
import { Product } from '../../productos/entities/product.entity';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  proveedor_id!: number;

  @Column()
  producto_id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: Proveedor;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'producto_id' })
  producto!: Product;
}
