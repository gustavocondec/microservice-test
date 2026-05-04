import { type TransactionRejectionCode, type TransactionStatus, type TransactionType } from '@app/contracts';

export const TRANSACTIONS_REPOSITORY = 'TRANSACTIONS_REPOSITORY';

export type TransactionRecord = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  idempotencyKey: string;
  rejectionCode?: TransactionRejectionCode | null;
  rejectionMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTransactionRecord = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  idempotencyKey: string;
};

export interface TransactionsRepository {
  create(input: CreateTransactionRecord): Promise<TransactionRecord>;
  findById(transactionId: string): Promise<TransactionRecord | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<TransactionRecord | null>;
  save(transaction: TransactionRecord): Promise<TransactionRecord>;
}
