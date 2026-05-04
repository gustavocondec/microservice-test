import { TransactionNotFoundError } from '../../domain/errors/transaction-not-found.error';
import {
  type TransactionRecord,
  type TransactionsRepository,
} from '../ports/transactions.repository';

export class GetTransactionUseCase {
  constructor(private readonly transactionRepository: TransactionsRepository) {}

  async execute(transactionId: string): Promise<TransactionRecord> {
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new TransactionNotFoundError();
    }

    return transaction;
  }
}
