import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  phone!: string | null;

  @Column({ nullable: true })
  email!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
