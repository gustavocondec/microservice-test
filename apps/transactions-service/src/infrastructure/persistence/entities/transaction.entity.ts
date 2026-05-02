import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TransactionRejectionCode, TransactionStatus, TransactionType } from '@app/contracts';

const numericTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity({ name: 'transactions' })
export class TransactionEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: TransactionType;

  @Column({ type: 'varchar', length: 20 })
  status!: TransactionStatus;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: numericTransformer })
  amount!: number;

  @Column({ name: 'source_account_id', type: 'varchar', length: 36, nullable: true })
  sourceAccountId?: string | null;

  @Column({ name: 'target_account_id', type: 'varchar', length: 36, nullable: true })
  targetAccountId?: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 120, unique: true })
  idempotencyKey!: string;

  @Column({ name: 'rejection_code', type: 'varchar', length: 50, nullable: true })
  rejectionCode?: TransactionRejectionCode | null;

  @Column({ name: 'rejection_message', type: 'varchar', length: 300, nullable: true })
  rejectionMessage?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
