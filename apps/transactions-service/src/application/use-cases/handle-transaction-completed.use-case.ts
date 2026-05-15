import { type DomainEvent, type TransactionCompletedPayload } from '@app/contracts';
import { type ProcessedEventsPort } from '../ports/processed-events.port';
import { type TransactionsRepository } from '../ports/transactions.repository';
import { type GetTransactionUseCase } from './get-transaction.use-case';

export class HandleTransactionCompletedUseCase {
  constructor(
    private readonly transactionRepository: TransactionsRepository,
    private readonly processedEventsService: ProcessedEventsPort,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  async execute(event: DomainEvent<TransactionCompletedPayload>): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      return;
    }

    const transaction = await this.getTransactionUseCase.execute(event.payload.transactionId);

    transaction.complete();

    await this.transactionRepository.save(transaction);
    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }
}
