import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAccounts1712700000000 implements MigrationInterface {
  name = 'InitAccounts1712700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(36) PRIMARY KEY,
        client_id VARCHAR(36) NOT NULL REFERENCES clients(id),
        currency VARCHAR(3) NOT NULL,
        balance NUMERIC(14, 2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_client_id ON accounts(client_id);
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
    await queryRunner.query(`DROP TABLE IF EXISTS accounts;`);
    await queryRunner.query(`DROP TABLE IF EXISTS clients;`);
  }
}
