import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProveedoresTable1747094400005 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE proveedores (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR NOT NULL,
        phone      VARCHAR,
        email      VARCHAR,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE proveedores`);
  }
}
