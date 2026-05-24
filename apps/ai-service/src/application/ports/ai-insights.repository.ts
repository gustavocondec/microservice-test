import { type AiInsight } from '../../domain/entities/ai-insight';

export const AI_INSIGHTS_REPOSITORY = 'AI_INSIGHTS_REPOSITORY';

export interface AiInsightsRepository {
  findByAccountId(accountId: string): Promise<AiInsight[]>;
  findByTransactionId(transactionId: string): Promise<AiInsight | null>;
  upsertByTransactionId(input: AiInsight): Promise<void>;
}
