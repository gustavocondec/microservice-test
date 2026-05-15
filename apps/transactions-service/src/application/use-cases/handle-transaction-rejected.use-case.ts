import {
  type DomainEvent,
  type TransactionRejectedPayload,
} from '@app/contracts';
import { type ProcessedEventsPort } from '../ports/processed-events.port';
import { type TransactionsRepository } from '../ports/transactions.repository';
import { GetTransactionUseCase } from './get-transaction.use-case';

export class HandleTransactionRejectedUseCase {
  constructor(
    private readonly transactionRepository: TransactionsRepository,
    private readonly processedEventsService: ProcessedEventsPort,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  async execute(event: DomainEvent<TransactionRejectedPayload>): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      return;
    }

    const transaction = await this.getTransactionUseCase.execute(event.payload.transactionId);

    transaction.reject(event.payload.reasonCode, event.payload.reasonMessage);

    await this.transactionRepository.save(transaction);
    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }
}
