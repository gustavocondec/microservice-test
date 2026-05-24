import { randomUUID } from 'crypto';
import { type DomainEvent, type TransactionRejectedPayload } from '@app/contracts';
import { AiInsight } from '../../domain/entities/ai-insight';
import { type AiInsightsRepository } from '../ports/ai-insights.repository';
import { type ExplainTransactionInput, type LlmPort } from '../ports/llm.port';
import { type ProcessedEventsPort } from '../ports/processed-events.port';

export class HandleTransactionRejectedUseCase {
  constructor(
    private readonly aiInsightRepository: AiInsightsRepository,
    private readonly processedEventsService: ProcessedEventsPort,
    private readonly llmPort: LlmPort,
  ) {}

  async execute(event: DomainEvent<TransactionRejectedPayload>): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      return;
    }

    const explanation = await this.llmPort.explainTransaction(this.toExplainInput(event.payload));

    const insight = AiInsight.create({
      id: randomUUID(),
      transactionId: event.payload.transactionId,
      type: event.payload.type,
      status: event.payload.status,
      amount: event.payload.amount,
      sourceAccountId: event.payload.sourceAccountId ?? null,
      targetAccountId: event.payload.targetAccountId ?? null,
      reasonCode: event.payload.reasonCode,
      explanation,
    });

    await this.aiInsightRepository.upsertByTransactionId(insight);

    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }

  private toExplainInput(payload: TransactionRejectedPayload): ExplainTransactionInput {
    return {
      transactionId: payload.transactionId,
      type: payload.type,
      status: payload.status,
      amount: payload.amount,
      sourceAccountId: payload.sourceAccountId,
      targetAccountId: payload.targetAccountId,
      reasonCode: payload.reasonCode,
      reasonMessage: payload.reasonMessage,
    };
  }
}
