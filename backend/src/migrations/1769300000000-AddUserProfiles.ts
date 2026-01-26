import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfiles1769300000000 implements MigrationInterface {
  name = 'AddUserProfiles1769300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "account_id" character varying(56) NOT NULL, "account_type" smallint NOT NULL, "data_hash" character varying(128) NOT NULL, "display_name" character varying NOT NULL, "email" character varying, "avatar_url" character varying, "profile_json" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_user_profiles_user_id" UNIQUE ("user_id"), CONSTRAINT "UQ_user_profiles_account_id" UNIQUE ("account_id"), CONSTRAINT "PK_user_profiles_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_user_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_user_profiles_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "user_profiles"`);
  }
}
