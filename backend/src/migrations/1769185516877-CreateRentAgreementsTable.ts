import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRentAgreementsTable1769185516877 implements MigrationInterface {
  name = 'CreateRentAgreementsTable1769185516877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if rent_contracts exists, if so rename it, otherwise create rent_agreements
    const rentContractsExists = await queryRunner.hasTable('rent_contracts');

    if (rentContractsExists) {
      // Rename rent_contracts to rent_agreements
      await queryRunner.query(
        `ALTER TABLE "rent_contracts" RENAME TO "rent_agreements"`,
      );
    } else {
      // Create rent_agreements table from scratch
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "rent_agreements" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "agreement_number" VARCHAR(50) UNIQUE,
          "property_id" VARCHAR(255),
          "landlord_id" VARCHAR(255),
          "tenant_id" VARCHAR(255),
          "agent_id" VARCHAR(255),
          "landlord_stellar_pub_key" VARCHAR(56),
          "tenant_stellar_pub_key" VARCHAR(56),
          "agent_stellar_pub_key" VARCHAR(56),
          "escrow_account_pub_key" VARCHAR(56),
          "monthly_rent" DECIMAL(12,2) NOT NULL DEFAULT 0,
          "security_deposit" DECIMAL(12,2) NOT NULL DEFAULT 0,
          "agent_commission_rate" DECIMAL(5,2) DEFAULT 10.00,
          "escrow_balance" DECIMAL(12,2) DEFAULT 0.00,
          "total_paid" DECIMAL(12,2) DEFAULT 0.00,
          "start_date" TIMESTAMP,
          "end_date" TIMESTAMP,
          "last_payment_date" TIMESTAMP,
          "status" VARCHAR(50) DEFAULT 'draft',
          "termination_date" TIMESTAMP,
          "termination_reason" TEXT,
          "terms_and_conditions" TEXT,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Add new columns to rent_agreements table (if they don't exist from rename scenario)
    await queryRunner.query(`
            ALTER TABLE "rent_agreements"
            ADD COLUMN IF NOT EXISTS "agreement_number" VARCHAR(50) UNIQUE,
            ADD COLUMN IF NOT EXISTS "property_id" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "landlord_id" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "tenant_id" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "agent_id" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "landlord_stellar_pub_key" VARCHAR(56),
            ADD COLUMN IF NOT EXISTS "tenant_stellar_pub_key" VARCHAR(56),
            ADD COLUMN IF NOT EXISTS "agent_stellar_pub_key" VARCHAR(56),
            ADD COLUMN IF NOT EXISTS "escrow_account_pub_key" VARCHAR(56),
            ADD COLUMN IF NOT EXISTS "monthly_rent" DECIMAL(12,2) NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS "security_deposit" DECIMAL(12,2) NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS "agent_commission_rate" DECIMAL(5,2) DEFAULT 10.00,
            ADD COLUMN IF NOT EXISTS "escrow_balance" DECIMAL(12,2) DEFAULT 0.00,
            ADD COLUMN IF NOT EXISTS "total_paid" DECIMAL(12,2) DEFAULT 0.00,
            ADD COLUMN IF NOT EXISTS "start_date" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "end_date" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "last_payment_date" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'draft',
            ADD COLUMN IF NOT EXISTS "termination_date" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "termination_reason" TEXT,
            ADD COLUMN IF NOT EXISTS "terms_and_conditions" TEXT,
            ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);

    // Drop the old price column as we now have monthly_rent
    await queryRunner.query(
      `ALTER TABLE "rent_agreements" DROP COLUMN IF EXISTS "price"`,
    );

    // Drop the old property_address column as we now have property_id
    await queryRunner.query(
      `ALTER TABLE "rent_agreements" DROP COLUMN IF EXISTS "property_address"`,
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rent_agreements_landlord_id" ON "rent_agreements"("landlord_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rent_agreements_tenant_id" ON "rent_agreements"("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rent_agreements_agent_id" ON "rent_agreements"("agent_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rent_agreements_property_id" ON "rent_agreements"("property_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rent_agreements_status" ON "rent_agreements"("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rent_agreements_start_date" ON "rent_agreements"("start_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rent_agreements_end_date" ON "rent_agreements"("end_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rent_agreements_end_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rent_agreements_start_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rent_agreements_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rent_agreements_property_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rent_agreements_agent_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rent_agreements_tenant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rent_agreements_landlord_id"`,
    );

    // Add back old columns
    await queryRunner.query(
      `ALTER TABLE "rent_agreements" ADD COLUMN "property_address" VARCHAR(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "rent_agreements" ADD COLUMN "price" DECIMAL(10,2)`,
    );

    // Drop new columns
    await queryRunner.query(`
            ALTER TABLE "rent_agreements"
            DROP COLUMN IF EXISTS "updated_at",
            DROP COLUMN IF EXISTS "created_at",
            DROP COLUMN IF EXISTS "terms_and_conditions",
            DROP COLUMN IF EXISTS "termination_reason",
            DROP COLUMN IF EXISTS "termination_date",
            DROP COLUMN IF EXISTS "status",
            DROP COLUMN IF EXISTS "last_payment_date",
            DROP COLUMN IF EXISTS "end_date",
            DROP COLUMN IF EXISTS "start_date",
            DROP COLUMN IF EXISTS "total_paid",
            DROP COLUMN IF EXISTS "escrow_balance",
            DROP COLUMN IF EXISTS "agent_commission_rate",
            DROP COLUMN IF EXISTS "security_deposit",
            DROP COLUMN IF EXISTS "monthly_rent",
            DROP COLUMN IF EXISTS "escrow_account_pub_key",
            DROP COLUMN IF EXISTS "agent_stellar_pub_key",
            DROP COLUMN IF EXISTS "tenant_stellar_pub_key",
            DROP COLUMN IF EXISTS "landlord_stellar_pub_key",
            DROP COLUMN IF EXISTS "agent_id",
            DROP COLUMN IF EXISTS "tenant_id",
            DROP COLUMN IF EXISTS "landlord_id",
            DROP COLUMN IF EXISTS "property_id",
            DROP COLUMN IF EXISTS "agreement_number"
        `);

    // Rename back to rent_contracts
    await queryRunner.query(
      `ALTER TABLE "rent_agreements" RENAME TO "rent_contracts"`,
    );
  }
}
