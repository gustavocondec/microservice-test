import { randomUUID } from 'crypto';
import {
  type DomainEvent,
  KafkaTopics,
  type TransactionRequestedPayload,
  TransactionType,
} from '@app/contracts';
import { Transaction } from '../../domain/entities/transaction';
import { type TransactionsEventsPort } from '../ports/transactions-events.port';
import { type TransactionsRepository } from '../ports/transactions.repository';

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  sourceAccountId?: string;
  targetAccountId?: string;
  idempotencyKey: string;
  correlationId?: string;
};

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionsRepository,
    private readonly transactionsEventsPublisher: TransactionsEventsPort,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    const existingTransaction = await this.transactionRepository.findByIdempotencyKey(
      input.idempotencyKey,
    );

    if (existingTransaction) {
      return existingTransaction;
    }

    const transaction = Transaction.create({
      id: randomUUID(),
      type: input.type,
      amount: Number(input.amount),
      sourceAccountId: input.sourceAccountId ?? null,
      targetAccountId: input.targetAccountId ?? null,
      idempotencyKey: input.idempotencyKey,
    });
    const savedTransaction = await this.transactionRepository.save(transaction);

    const event: DomainEvent<TransactionRequestedPayload> = {
      metadata: {
        eventId: randomUUID(),
        eventType: KafkaTopics.TransactionRequested,
        occurredAt: new Date().toISOString(),
        correlationId: input.correlationId ?? savedTransaction.id,
      },
      payload: {
        transactionId: savedTransaction.id,
        type: savedTransaction.type,
        amount: savedTransaction.amount,
        sourceAccountId: savedTransaction.sourceAccountId ?? undefined,
        targetAccountId: savedTransaction.targetAccountId ?? undefined,
        idempotencyKey: savedTransaction.idempotencyKey,
        requestedAt: savedTransaction.createdAt?.toISOString() ?? new Date().toISOString(),
      },
    };

    await this.transactionsEventsPublisher.publish(KafkaTopics.TransactionRequested, event);

    return savedTransaction;
  }
}
