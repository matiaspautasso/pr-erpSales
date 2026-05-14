import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetTokensTable1747094400002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id"         SERIAL PRIMARY KEY,
        "token"      VARCHAR NOT NULL UNIQUE,
        "user_id"    INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at"    TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
  }
}
