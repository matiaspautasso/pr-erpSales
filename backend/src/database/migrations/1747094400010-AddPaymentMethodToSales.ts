import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodToSales1747094400010 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sales
        ADD COLUMN payment_method VARCHAR(10) NOT NULL DEFAULT 'cash'
        CHECK (payment_method IN ('cash','transfer','debit','credit'))
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE sales DROP COLUMN payment_method`);
  }
}
