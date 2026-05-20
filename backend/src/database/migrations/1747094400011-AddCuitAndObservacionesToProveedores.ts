import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCuitAndObservacionesToProveedores1747094400011 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE proveedores
        ADD COLUMN cuit VARCHAR NOT NULL DEFAULT '',
        ADD COLUMN observaciones TEXT
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE proveedores
        DROP COLUMN cuit,
        DROP COLUMN observaciones
    `);
  }
}
