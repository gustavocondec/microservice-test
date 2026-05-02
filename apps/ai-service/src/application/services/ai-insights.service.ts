import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  type DomainEvent,
  type TransactionCompletedPayload,
  type TransactionRejectedPayload,
} from '@app/contracts';
import { ProcessedEventsService } from '@app/shared';
import {
  ExplainTransactionInput,
  LLM_PORT,
  LlmPort,
  SummaryInsightInput,
} from '../ports/llm.port';
import { AiInsightEntity } from '../../infrastructure/persistence/entities/ai-insight.entity';

@Injectable()
export class AiInsightsService {
  constructor(
    @InjectRepository(AiInsightEntity)
    private readonly aiInsightRepository: Repository<AiInsightEntity>,
    private readonly processedEventsService: ProcessedEventsService,
    @Inject(LLM_PORT)
    private readonly llmPort: LlmPort,
  ) {}

  async handleTransactionCompleted(
    event: DomainEvent<TransactionCompletedPayload>,
  ): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      return;
    }

    const explanation = await this.llmPort.explainTransaction(this.toExplainInput(event.payload));

    await this.aiInsightRepository.upsert(
      {
        id: randomUUID(),
        transactionId: event.payload.transactionId,
        type: event.payload.type,
        status: event.payload.status,
        amount: event.payload.amount,
        sourceAccountId: event.payload.sourceAccountId ?? null,
        targetAccountId: event.payload.targetAccountId ?? null,
        reasonCode: null,
        explanation,
      },
      ['transactionId'],
    );

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

    await this.aiInsightRepository.upsert(
      {
        id: randomUUID(),
        transactionId: event.payload.transactionId,
        type: event.payload.type,
        status: event.payload.status,
        amount: event.payload.amount,
        sourceAccountId: event.payload.sourceAccountId ?? null,
        targetAccountId: event.payload.targetAccountId ?? null,
        reasonCode: event.payload.reasonCode,
        explanation,
      },
      ['transactionId'],
    );

    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }

  async getTransactionExplanation(transactionId: string): Promise<AiInsightEntity> {
    const explanation = await this.aiInsightRepository.findOne({
      where: { transactionId },
    });

    if (!explanation) {
      throw new NotFoundException('No explanation found for the provided transaction');
    }

    return explanation;
  }

  async summarizeAccount(accountId: string): Promise<{ accountId: string; summary: string }> {
    const insights = await this.aiInsightRepository
      .createQueryBuilder('insight')
      .where('insight.sourceAccountId = :accountId', { accountId })
      .orWhere('insight.targetAccountId = :accountId', { accountId })
      .orderBy('insight.createdAt', 'ASC')
      .getMany();

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
