import { type AiInsightsRepository } from '../ports/ai-insights.repository';
import { type LlmPort, type SummaryInsightInput } from '../ports/llm.port';

export class SummarizeAccountUseCase {
  constructor(
    private readonly aiInsightRepository: AiInsightsRepository,
    private readonly llmPort: LlmPort,
  ) {}

  async execute(accountId: string): Promise<{ accountId: string; summary: string }> {
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
}
