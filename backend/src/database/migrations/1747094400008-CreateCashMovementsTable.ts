import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCashMovementsTable1747094400008 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE cash_movements (
        id               SERIAL PRIMARY KEY,
        cash_register_id INTEGER NOT NULL REFERENCES cash_registers(id),
        type             VARCHAR(12) NOT NULL CHECK (type IN ('income','expense','withdrawal')),
        amount           DECIMAL(12,2) NOT NULL,
        description      VARCHAR,
        created_at       TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_cash_movements_register ON cash_movements(cash_register_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE cash_movements`);
  }
}
