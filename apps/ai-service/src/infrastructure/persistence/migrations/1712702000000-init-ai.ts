import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAi1712702000000 implements MigrationInterface {
  name = 'InitAi1712702000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ai_insights (
        id VARCHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(36) NOT NULL UNIQUE,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        amount NUMERIC(14, 2) NOT NULL,
        source_account_id VARCHAR(36),
        target_account_id VARCHAR(36),
        reason_code VARCHAR(50),
        explanation TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_insights_source_account ON ai_insights(source_account_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_insights_target_account ON ai_insights(target_account_id);
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
    await queryRunner.query(`DROP TABLE IF EXISTS ai_insights;`);
  }
}
