import { AiInsightNotFoundError } from '../../domain/errors/ai-insight-not-found.error';
import { type AiInsight } from '../../domain/entities/ai-insight';
import { type AiInsightsRepository } from '../ports/ai-insights.repository';

export class GetTransactionExplanationUseCase {
  constructor(private readonly aiInsightRepository: AiInsightsRepository) {}

  async execute(transactionId: string): Promise<AiInsight> {
    const explanation = await this.aiInsightRepository.findByTransactionId(transactionId);

    if (!explanation) {
      throw new AiInsightNotFoundError();
    }

    return explanation;
  }
}
