import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1747094400001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            SERIAL PRIMARY KEY,
        "email"         VARCHAR NOT NULL UNIQUE,
        "password_hash" VARCHAR NOT NULL,
        "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
