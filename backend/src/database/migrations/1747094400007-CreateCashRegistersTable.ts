import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCashRegistersTable1747094400007 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE cash_registers (
        id             SERIAL PRIMARY KEY,
        opening_amount DECIMAL(12,2) NOT NULL,
        closing_amount DECIMAL(12,2),
        real_amount    DECIMAL(12,2),
        difference     DECIMAL(12,2),
        status         VARCHAR(6) NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
        opened_at      TIMESTAMP NOT NULL DEFAULT now(),
        closed_at      TIMESTAMP
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE cash_registers`);
  }
}
