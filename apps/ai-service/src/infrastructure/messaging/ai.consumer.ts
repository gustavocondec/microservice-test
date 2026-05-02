import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  type DomainEvent,
  KafkaTopics,
  type TransactionCompletedPayload,
  type TransactionRejectedPayload,
} from '@app/contracts';
import { AiInsightsService } from '../../application/services/ai-insights.service';

@Controller()
export class AiConsumerController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @EventPattern(KafkaTopics.TransactionCompleted)
  async handleTransactionCompleted(
    @Payload() event: DomainEvent<TransactionCompletedPayload>,
  ): Promise<void> {
    await this.aiInsightsService.handleTransactionCompleted(event);
  }

  @EventPattern(KafkaTopics.TransactionRejected)
  async handleTransactionRejected(
    @Payload() event: DomainEvent<TransactionRejectedPayload>,
  ): Promise<void> {
    await this.aiInsightsService.handleTransactionRejected(event);
  }
}
