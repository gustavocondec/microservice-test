import { AiInsightNotFoundError } from '../../domain/errors/ai-insight-not-found.error';
import {
  type AiInsightRecord,
  type AiInsightsRepository,
} from '../ports/ai-insights.repository';

export class GetTransactionExplanationUseCase {
  constructor(private readonly aiInsightRepository: AiInsightsRepository) {}

  async execute(transactionId: string): Promise<AiInsightRecord> {
    const explanation = await this.aiInsightRepository.findByTransactionId(transactionId);

    if (!explanation) {
      throw new AiInsightNotFoundError();
    }

    return explanation;
  }
}
