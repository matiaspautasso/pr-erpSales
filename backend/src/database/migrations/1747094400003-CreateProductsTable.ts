import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1747094400003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"            SERIAL PRIMARY KEY,
        "name"          VARCHAR NOT NULL,
        "category"      VARCHAR NOT NULL,
        "unit_of_sale"  VARCHAR(6) NOT NULL CHECK (unit_of_sale IN ('kg', 'unit')),
        "price"         DECIMAL(10,2) NOT NULL,
        "cost"          DECIMAL(10,2) NOT NULL,
        "current_stock" DECIMAL(10,3) NOT NULL DEFAULT 0,
        "min_stock"     DECIMAL(10,3) NOT NULL DEFAULT 0,
        "status"        VARCHAR(8) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
