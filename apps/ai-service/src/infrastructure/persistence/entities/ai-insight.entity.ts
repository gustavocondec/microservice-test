import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TransactionRejectionCode, TransactionStatus, TransactionType } from '@app/contracts';

const numericTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity({ name: 'ai_insights' })
export class AiInsightEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ name: 'transaction_id', type: 'varchar', length: 36, unique: true })
  transactionId!: string;

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

  @Column({ name: 'reason_code', type: 'varchar', length: 50, nullable: true })
  reasonCode?: TransactionRejectionCode | null;

  @Column({ type: 'text' })
  explanation!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
