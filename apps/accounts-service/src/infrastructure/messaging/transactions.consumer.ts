import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { type DomainEvent, KafkaTopics, type TransactionRequestedPayload } from '@app/contracts';
import { HandleTransactionRequestedUseCase } from '../../application/use-cases/handle-transaction-requested.use-case';

@Controller()
export class TransactionsConsumerController {
  constructor(
    private readonly handleTransactionRequestedUseCase: HandleTransactionRequestedUseCase,
  ) {}

  @EventPattern(KafkaTopics.TransactionRequested)
  async handleTransactionRequested(
    @Payload() event: DomainEvent<TransactionRequestedPayload>,
  ): Promise<void> {
    await this.handleTransactionRequestedUseCase.execute(event);
  }
}
