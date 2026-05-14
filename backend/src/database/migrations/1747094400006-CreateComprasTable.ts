import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComprasTable1747094400006 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE compras (
        id           SERIAL PRIMARY KEY,
        proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
        producto_id  INTEGER NOT NULL REFERENCES products(id),
        quantity     DECIMAL(10,3) NOT NULL,
        unit_cost    DECIMAL(10,2) NOT NULL,
        total        DECIMAL(12,2) NOT NULL,
        date         DATE NOT NULL,
        notes        VARCHAR,
        created_at   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_compras_proveedor ON compras(proveedor_id)`);
    await queryRunner.query(`CREATE INDEX idx_compras_producto ON compras(producto_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE compras`);
  }
}
