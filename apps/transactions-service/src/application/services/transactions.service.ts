import { randomUUID } from 'crypto';
import {
  type DomainEvent,
  KafkaTopics,
  type TransactionCompletedPayload,
  type TransactionRejectedPayload,
  type TransactionRequestedPayload,
  TransactionStatus,
  TransactionType,
} from '@app/contracts';
import { InvalidTransactionError } from '../../domain/errors/invalid-transaction.error';
import { TransactionNotFoundError } from '../../domain/errors/transaction-not-found.error';
import { type ProcessedEventsPort } from '../ports/processed-events.port';
import { type TransactionsEventsPort } from '../ports/transactions-events.port';
import {
  type TransactionRecord,
  type TransactionsRepository,
} from '../ports/transactions.repository';

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  sourceAccountId?: string;
  targetAccountId?: string;
  idempotencyKey: string;
  correlationId?: string;
};

export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionsRepository,
    private readonly processedEventsService: ProcessedEventsPort,
    private readonly transactionsEventsPublisher: TransactionsEventsPort,
  ) {}

  async createTransaction(input: CreateTransactionInput): Promise<TransactionRecord> {
    this.validateTransactionRequest(input);

    const existingTransaction = await this.transactionRepository.findByIdempotencyKey(
      input.idempotencyKey,
    );

    if (existingTransaction) {
      return existingTransaction;
    }

    const transaction = await this.transactionRepository.create({
      id: randomUUID(),
      type: input.type,
      status: TransactionStatus.PENDING,
      amount: Number(input.amount),
      sourceAccountId: input.sourceAccountId ?? null,
      targetAccountId: input.targetAccountId ?? null,
      idempotencyKey: input.idempotencyKey,
    });

    const event: DomainEvent<TransactionRequestedPayload> = {
      metadata: {
        eventId: randomUUID(),
        eventType: KafkaTopics.TransactionRequested,
        occurredAt: new Date().toISOString(),
        correlationId: input.correlationId ?? transaction.id,
      },
      payload: {
        transactionId: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        sourceAccountId: transaction.sourceAccountId ?? undefined,
        targetAccountId: transaction.targetAccountId ?? undefined,
        idempotencyKey: transaction.idempotencyKey,
        requestedAt: transaction.createdAt.toISOString(),
      },
    };

    await this.transactionsEventsPublisher.publish(KafkaTopics.TransactionRequested, event);

    return transaction;
  }

  async getTransaction(transactionId: string): Promise<TransactionRecord> {
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new TransactionNotFoundError();
    }

    return transaction;
  }

  async handleTransactionCompleted(
    event: DomainEvent<TransactionCompletedPayload>,
  ): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      return;
    }

    const transaction = await this.getTransaction(event.payload.transactionId);

    transaction.status = TransactionStatus.COMPLETED;
    transaction.rejectionCode = null;
    transaction.rejectionMessage = null;

    await this.transactionRepository.save(transaction);
    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }

  async handleTransactionRejected(
    event: DomainEvent<TransactionRejectedPayload>,
  ): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      return;
    }

    const transaction = await this.getTransaction(event.payload.transactionId);

    transaction.status = TransactionStatus.REJECTED;
    transaction.rejectionCode = event.payload.reasonCode;
    transaction.rejectionMessage = event.payload.reasonMessage;

    await this.transactionRepository.save(transaction);
    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }

  private validateTransactionRequest(input: CreateTransactionInput): void {
    switch (input.type) {
      case TransactionType.DEPOSIT:
        if (!input.targetAccountId) {
          throw new InvalidTransactionError('Deposits require a target account');
        }
        break;
      case TransactionType.WITHDRAW:
        if (!input.sourceAccountId) {
          throw new InvalidTransactionError('Withdrawals require a source account');
        }
        break;
      case TransactionType.TRANSFER:
        if (!input.sourceAccountId || !input.targetAccountId) {
          throw new InvalidTransactionError('Transfers require source and target accounts');
        }
        if (input.sourceAccountId === input.targetAccountId) {
          throw new InvalidTransactionError('Transfers require different accounts');
        }
        break;
      default:
        throw new InvalidTransactionError('Unsupported transaction type');
    }
  }
}
