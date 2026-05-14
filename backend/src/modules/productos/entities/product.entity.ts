import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ type: 'varchar', length: 6 })
  unit_of_sale!: 'kg' | 'unit';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  current_stock!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  min_stock!: number;

  @Column({ type: 'varchar', length: 8, default: 'active' })
  status!: 'active' | 'inactive';

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
