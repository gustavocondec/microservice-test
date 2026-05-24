import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type AiInsightsRepository } from '../../application/ports/ai-insights.repository';
import { AiInsight } from '../../domain/entities/ai-insight';
import { AiInsightEntity } from './entities/ai-insight.entity';

@Injectable()
export class TypeOrmAiInsightsRepository implements AiInsightsRepository {
  constructor(
    @InjectRepository(AiInsightEntity)
    private readonly aiInsightRepository: Repository<AiInsightEntity>,
  ) {}

  async findByAccountId(accountId: string): Promise<AiInsight[]> {
    const insights = await this.aiInsightRepository
      .createQueryBuilder('insight')
      .where('insight.sourceAccountId = :accountId', { accountId })
      .orWhere('insight.targetAccountId = :accountId', { accountId })
      .orderBy('insight.createdAt', 'ASC')
      .getMany();

    return insights.map((insight) => this.toDomain(insight));
  }

  async findByTransactionId(transactionId: string): Promise<AiInsight | null> {
    const insight = await this.aiInsightRepository.findOne({
      where: { transactionId },
    });

    return insight ? this.toDomain(insight) : null;
  }

  async upsertByTransactionId(input: AiInsight): Promise<void> {
    await this.aiInsightRepository.upsert(input.toSnapshot(), ['transactionId']);
  }

  private toDomain(insight: AiInsightEntity): AiInsight {
    return AiInsight.restore({
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
    });
  }
}
