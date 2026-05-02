import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  type DomainEvent,
  KafkaTopics,
  type TransactionCompletedPayload,
  type TransactionRejectedPayload,
} from '@app/contracts';
import { TransactionsService } from '../../application/services/transactions.service';

@Controller()
export class TransactionsEventsConsumerController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @EventPattern(KafkaTopics.TransactionCompleted)
  async handleTransactionCompleted(
    @Payload() event: DomainEvent<TransactionCompletedPayload>,
  ): Promise<void> {
    await this.transactionsService.handleTransactionCompleted(event);
  }

  @EventPattern(KafkaTopics.TransactionRejected)
  async handleTransactionRejected(
    @Payload() event: DomainEvent<TransactionRejectedPayload>,
  ): Promise<void> {
    await this.transactionsService.handleTransactionRejected(event);
  }
}
