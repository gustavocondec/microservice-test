import { Transaction } from '../../domain/entities/transaction';

export const TRANSACTIONS_REPOSITORY = 'TRANSACTIONS_REPOSITORY';

export interface TransactionsRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findById(transactionId: string): Promise<Transaction | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null>;
}
