import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDiscountToSales1747094400030 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sales
        ADD COLUMN discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE sales DROP COLUMN discount_percent`);
  }
}
