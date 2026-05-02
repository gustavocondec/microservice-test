import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTransactions1712701000000 implements MigrationInterface {
  name = 'InitTransactions1712701000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        amount NUMERIC(14, 2) NOT NULL,
        source_account_id VARCHAR(36),
        target_account_id VARCHAR(36),
        idempotency_key VARCHAR(120) NOT NULL UNIQUE,
        rejection_code VARCHAR(50),
        rejection_message VARCHAR(300),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS processed_events (
        event_id VARCHAR(100) PRIMARY KEY,
        event_type VARCHAR(150) NOT NULL,
        processed_at TIMESTAMPTZ NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS processed_events;`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions;`);
  }
}
