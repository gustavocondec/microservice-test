import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { type DomainEvent, KafkaTopics, type TransactionRequestedPayload } from '@app/contracts';
import { TransactionOrchestratorService } from '../../application/services/transaction-orchestrator.service';

@Controller()
export class TransactionsConsumerController {
  constructor(
    private readonly transactionOrchestratorService: TransactionOrchestratorService,
  ) {}

  @EventPattern(KafkaTopics.TransactionRequested)
  async handleTransactionRequested(
    @Payload() event: DomainEvent<TransactionRequestedPayload>,
  ): Promise<void> {
    await this.transactionOrchestratorService.handleTransactionRequested(event);
  }
}
