import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockMovementsTable1747094400004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "stock_movements" (
        "id"          SERIAL PRIMARY KEY,
        "product_id"  INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "type"        VARCHAR(20) NOT NULL,
        "quantity"    DECIMAL(10,3) NOT NULL,
        "reason"      VARCHAR,
        "origin_id"   INTEGER,
        "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_stock_movements_product_id" ON "stock_movements"("product_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stock_movements"`);
  }
}
