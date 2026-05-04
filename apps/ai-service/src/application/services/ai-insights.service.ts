import { randomUUID } from 'crypto';
import {
  type DomainEvent,
  type TransactionCompletedPayload,
  type TransactionRejectedPayload,
} from '@app/contracts';
import { AiInsightNotFoundError } from '../../domain/errors/ai-insight-not-found.error';
import {
  type AiInsightRecord,
  type AiInsightsRepository,
} from '../ports/ai-insights.repository';
import {
  type ExplainTransactionInput,
  type LlmPort,
  type SummaryInsightInput,
} from '../ports/llm.port';
import { type ProcessedEventsPort } from '../ports/processed-events.port';

export class AiInsightsService {
  constructor(
    private readonly aiInsightRepository: AiInsightsRepository,
    private readonly processedEventsService: ProcessedEventsPort,
    private readonly llmPort: LlmPort,
  ) {}

  async handleTransactionCompleted(
    event: DomainEvent<TransactionCompletedPayload>,
  ): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      return;
    }

    const explanation = await this.llmPort.explainTransaction(this.toExplainInput(event.payload));

    await this.aiInsightRepository.upsertByTransactionId({
      id: randomUUID(),
      transactionId: event.payload.transactionId,
      type: event.payload.type,
      status: event.payload.status,
      amount: event.payload.amount,
      sourceAccountId: event.payload.sourceAccountId ?? null,
      targetAccountId: event.payload.targetAccountId ?? null,
      reasonCode: null,
      explanation,
    });

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

    const explanation = await this.llmPort.explainTransaction(this.toExplainInput(event.payload));

    await this.aiInsightRepository.upsertByTransactionId({
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

    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }

  async getTransactionExplanation(transactionId: string): Promise<AiInsightRecord> {
    const explanation = await this.aiInsightRepository.findByTransactionId(transactionId);

    if (!explanation) {
      throw new AiInsightNotFoundError();
    }

    return explanation;
  }

  async summarizeAccount(accountId: string): Promise<{ accountId: string; summary: string }> {
    const insights = await this.aiInsightRepository.findByAccountId(accountId);

    const summary = await this.llmPort.summarizeAccountHistory(
      accountId,
      insights.map<SummaryInsightInput>((insight) => ({
        transactionId: insight.transactionId,
        type: insight.type,
        status: insight.status,
        amount: insight.amount,
        sourceAccountId: insight.sourceAccountId,
        targetAccountId: insight.targetAccountId,
        explanation: insight.explanation,
        createdAt: insight.createdAt,
      })),
    );

    return {
      accountId,
      summary,
    };
  }

  private toExplainInput(
    payload: TransactionCompletedPayload | TransactionRejectedPayload,
  ): ExplainTransactionInput {
    return {
      transactionId: payload.transactionId,
      type: payload.type,
      status: payload.status,
      amount: payload.amount,
      sourceAccountId: payload.sourceAccountId,
      targetAccountId: payload.targetAccountId,
      reasonCode: 'reasonCode' in payload ? payload.reasonCode : undefined,
      reasonMessage: 'reasonMessage' in payload ? payload.reasonMessage : undefined,
    };
  }
}
