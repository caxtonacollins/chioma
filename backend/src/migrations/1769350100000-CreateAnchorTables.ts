/**
 * MIT License
 * Copyright (c) 2026 caxton strange
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnchorTables1769350100000 implements MigrationInterface {
  name = 'CreateAnchorTables1769350100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "anchor_transaction_status_enum" AS ENUM(
        'pending', 'processing', 'completed', 'failed', 'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "anchor_transaction_type_enum" AS ENUM(
        'deposit', 'withdrawal'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_method_type_enum" AS ENUM(
        'SEPA', 'SWIFT', 'ACH'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "anchor_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "anchorTransactionId" character varying NOT NULL,
        "type" "anchor_transaction_type_enum" NOT NULL,
        "status" "anchor_transaction_status_enum" NOT NULL DEFAULT 'pending',
        "amount" numeric(20,8) NOT NULL,
        "currency" character varying(3) NOT NULL,
        "walletAddress" character varying NOT NULL,
        "paymentMethod" "payment_method_type_enum",
        "destination" text,
        "stellarTransactionHash" character varying,
        "errorMessage" text,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_anchor_transaction_id" UNIQUE ("anchorTransactionId"),
        CONSTRAINT "PK_anchor_transactions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_anchor_transactions_wallet" ON "anchor_transactions" ("walletAddress")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_anchor_transactions_status" ON "anchor_transactions" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_anchor_transactions_type" ON "anchor_transactions" ("type")
    `);

    await queryRunner.query(`
      CREATE TABLE "supported_currencies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(3) NOT NULL,
        "name" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "minAmount" numeric(20,8),
        "maxAmount" numeric(20,8),
        "fee" numeric(5,4) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_supported_currencies_code" UNIQUE ("code"),
        CONSTRAINT "PK_supported_currencies" PRIMARY KEY ("id")
      )
    `);

    // Insert default supported currencies
    await queryRunner.query(`
      INSERT INTO "supported_currencies" ("code", "name", "isActive", "minAmount", "maxAmount", "fee")
      VALUES 
        ('USD', 'US Dollar', true, 1.00, 10000.00, 0.0050),
        ('EUR', 'Euro', true, 1.00, 10000.00, 0.0050),
        ('GBP', 'British Pound', true, 1.00, 10000.00, 0.0050),
        ('NGN', 'Nigerian Naira', true, 500.00, 5000000.00, 0.0100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_anchor_transactions_type"`);
    await queryRunner.query(`DROP INDEX "IDX_anchor_transactions_status"`);
    await queryRunner.query(`DROP INDEX "IDX_anchor_transactions_wallet"`);
    await queryRunner.query(`DROP TABLE "anchor_transactions"`);
    await queryRunner.query(`DROP TABLE "supported_currencies"`);
    await queryRunner.query(`DROP TYPE "payment_method_type_enum"`);
    await queryRunner.query(`DROP TYPE "anchor_transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "anchor_transaction_status_enum"`);
  }
}
