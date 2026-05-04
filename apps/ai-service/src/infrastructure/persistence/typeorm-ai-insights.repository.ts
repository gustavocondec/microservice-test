import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type AiInsightRecord,
  type AiInsightsRepository,
  type UpsertAiInsightRecord,
} from '../../application/ports/ai-insights.repository';
import { AiInsightEntity } from './entities/ai-insight.entity';

@Injectable()
export class TypeOrmAiInsightsRepository implements AiInsightsRepository {
  constructor(
    @InjectRepository(AiInsightEntity)
    private readonly aiInsightRepository: Repository<AiInsightEntity>,
  ) {}

  async findByAccountId(accountId: string): Promise<AiInsightRecord[]> {
    const insights = await this.aiInsightRepository
      .createQueryBuilder('insight')
      .where('insight.sourceAccountId = :accountId', { accountId })
      .orWhere('insight.targetAccountId = :accountId', { accountId })
      .orderBy('insight.createdAt', 'ASC')
      .getMany();

    return insights.map((insight) => this.toRecord(insight));
  }

  async findByTransactionId(transactionId: string): Promise<AiInsightRecord | null> {
    const insight = await this.aiInsightRepository.findOne({
      where: { transactionId },
    });

    return insight ? this.toRecord(insight) : null;
  }

  async upsertByTransactionId(input: UpsertAiInsightRecord): Promise<void> {
    await this.aiInsightRepository.upsert(input, ['transactionId']);
  }

  private toRecord(insight: AiInsightEntity): AiInsightRecord {
    return {
      id: insight.id,
      transactionId: insight.transactionId,
      type: insight.type,
      status: insight.status,
      amount: insight.amount,
      sourceAccountId: insight.sourceAccountId,
      targetAccountId: insight.targetAccountId,
      reasonCode: insight.reasonCode,
      explanation: insight.explanation,
      createdAt: insight.createdAt,
      updatedAt: insight.updatedAt,
    };
  }
}
