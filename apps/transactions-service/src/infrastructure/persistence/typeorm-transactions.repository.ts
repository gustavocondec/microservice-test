import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type CreateTransactionRecord,
  type TransactionRecord,
  type TransactionsRepository,
} from '../../application/ports/transactions.repository';
import { TransactionEntity } from './entities/transaction.entity';

@Injectable()
export class TypeOrmTransactionsRepository implements TransactionsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(input: CreateTransactionRecord): Promise<TransactionRecord> {
    const transaction = this.transactionRepository.create(input);
    const savedTransaction = await this.transactionRepository.save(transaction);

    return this.toRecord(savedTransaction);
  }

  async findById(transactionId: string): Promise<TransactionRecord | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    return transaction ? this.toRecord(transaction) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<TransactionRecord | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { idempotencyKey },
    });

    return transaction ? this.toRecord(transaction) : null;
  }

  async save(transaction: TransactionRecord): Promise<TransactionRecord> {
    const savedTransaction = await this.transactionRepository.save(
      this.transactionRepository.create(transaction),
    );

    return this.toRecord(savedTransaction);
  }

  private toRecord(transaction: TransactionEntity): TransactionRecord {
    return {
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
    };
  }
}
