import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { buildEventMetadata, ProcessedEventsService } from '@app/shared';
import { InvalidTransactionError } from '../../domain/errors/invalid-transaction.error';
import { CreateTransactionDto } from '../../infrastructure/http/dto/create-transaction.dto';
import { TransactionsEventsPublisher } from '../../infrastructure/messaging/transactions-events.publisher';
import { TransactionEntity } from '../../infrastructure/persistence/entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly processedEventsService: ProcessedEventsService,
    private readonly transactionsEventsPublisher: TransactionsEventsPublisher,
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<TransactionEntity> {
    this.validateTransactionRequest(dto);

    const existingTransaction = await this.transactionRepository.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if (existingTransaction) {
      return existingTransaction;
    }

    const transaction = this.transactionRepository.create({
      id: randomUUID(),
      type: dto.type,
      status: TransactionStatus.PENDING,
      amount: Number(dto.amount),
      sourceAccountId: dto.sourceAccountId ?? null,
      targetAccountId: dto.targetAccountId ?? null,
      idempotencyKey: dto.idempotencyKey,
    });

    await this.transactionRepository.save(transaction);

    const event: DomainEvent<TransactionRequestedPayload> = {
      metadata: buildEventMetadata(
        KafkaTopics.TransactionRequested,
        dto.correlationId ?? transaction.id,
      ),
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

  async getTransaction(transactionId: string): Promise<TransactionEntity> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
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

  private validateTransactionRequest(dto: CreateTransactionDto): void {
    switch (dto.type) {
      case TransactionType.DEPOSIT:
        if (!dto.targetAccountId) {
          throw new InvalidTransactionError('Deposits require a target account');
        }
        break;
      case TransactionType.WITHDRAW:
        if (!dto.sourceAccountId) {
          throw new InvalidTransactionError('Withdrawals require a source account');
        }
        break;
      case TransactionType.TRANSFER:
        if (!dto.sourceAccountId || !dto.targetAccountId) {
          throw new InvalidTransactionError('Transfers require source and target accounts');
        }
        if (dto.sourceAccountId === dto.targetAccountId) {
          throw new InvalidTransactionError('Transfers require different accounts');
        }
        break;
      default:
        throw new InvalidTransactionError('Unsupported transaction type');
    }
  }
}
