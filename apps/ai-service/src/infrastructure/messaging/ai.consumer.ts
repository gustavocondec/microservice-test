import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  type DomainEvent,
  KafkaTopics,
  type TransactionCompletedPayload,
  type TransactionRejectedPayload,
} from '@app/contracts';
import { HandleTransactionCompletedUseCase } from '../../application/use-cases/handle-transaction-completed.use-case';
import { HandleTransactionRejectedUseCase } from '../../application/use-cases/handle-transaction-rejected.use-case';

@Controller()
export class AiConsumerController {
  constructor(
    private readonly handleTransactionCompletedUseCase: HandleTransactionCompletedUseCase,
    private readonly handleTransactionRejectedUseCase: HandleTransactionRejectedUseCase,
  ) {}

  @EventPattern(KafkaTopics.TransactionCompleted)
  async handleTransactionCompleted(
    @Payload() event: DomainEvent<TransactionCompletedPayload>,
  ): Promise<void> {
    await this.handleTransactionCompletedUseCase.execute(event);
  }

  @EventPattern(KafkaTopics.TransactionRejected)
  async handleTransactionRejected(
    @Payload() event: DomainEvent<TransactionRejectedPayload>,
  ): Promise<void> {
    await this.handleTransactionRejectedUseCase.execute(event);
  }
}
