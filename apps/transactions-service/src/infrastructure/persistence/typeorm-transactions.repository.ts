import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type TransactionsRepository } from '../../application/ports/transactions.repository';
import { Transaction } from '../../domain/entities/transaction';
import { TransactionEntity } from './entities/transaction.entity';

@Injectable()
export class TypeOrmTransactionsRepository implements TransactionsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async save(input: Transaction): Promise<Transaction> {
    const transaction = this.transactionRepository.create(input.toSnapshot());
    const savedTransaction = await this.transactionRepository.save(transaction);

    return this.toDomain(savedTransaction);
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    return transaction ? this.toDomain(transaction) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { idempotencyKey },
    });

    return transaction ? this.toDomain(transaction) : null;
  }

  private toDomain(transaction: TransactionEntity): Transaction {
    return Transaction.restore({
      id: transaction.id,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      sourceAccountId: transaction.sourceAccountId,
      targetAccountId: transaction.targetAccountId,
      idempotencyKey: transaction.idempotencyKey,
      rejectionCode: transaction.rejectionCode,
      rejectionMessage: transaction.rejectionMessage,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    });
  }
}
