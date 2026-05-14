import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalesTable1747094400009 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE sales (
        id         SERIAL PRIMARY KEY,
        total      DECIMAL(12,2) NOT NULL,
        status     VARCHAR(10) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
        notes      VARCHAR,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE sale_items (
        id          SERIAL PRIMARY KEY,
        sale_id     INTEGER NOT NULL REFERENCES sales(id),
        producto_id INTEGER NOT NULL REFERENCES products(id),
        quantity    DECIMAL(10,3) NOT NULL,
        unit_price  DECIMAL(10,2) NOT NULL,
        subtotal    DECIMAL(12,2) NOT NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_sale_items_sale ON sale_items(sale_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE sale_items`);
    await queryRunner.query(`DROP TABLE sales`);
  }
}
