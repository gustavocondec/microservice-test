import { Injectable } from '@nestjs/common';
import { TransactionStatus, TransactionType } from '@app/contracts';
import {
  ExplainTransactionInput,
  LlmPort,
  SummaryInsightInput,
} from '../../application/ports/llm.port';

@Injectable()
export class MockLlmProvider implements LlmPort {
  async explainTransaction(input: ExplainTransactionInput): Promise<string> {
    if (input.status === TransactionStatus.REJECTED) {
      return `Transaction ${input.transactionId} was rejected because ${input.reasonMessage?.toLowerCase()}.`;
    }

    switch (input.type) {
      case TransactionType.DEPOSIT:
        return `Deposit ${input.transactionId} completed successfully for ${input.amount.toFixed(2)} into account ${input.targetAccountId}.`;
      case TransactionType.WITHDRAW:
        return `Withdrawal ${input.transactionId} completed successfully for ${input.amount.toFixed(2)} from account ${input.sourceAccountId}.`;
      case TransactionType.TRANSFER:
        return `Transfer ${input.transactionId} completed successfully for ${input.amount.toFixed(2)} from account ${input.sourceAccountId} to account ${input.targetAccountId}.`;
      default:
        return `Transaction ${input.transactionId} completed successfully.`;
    }
  }

  async summarizeAccountHistory(
    accountId: string,
    events: SummaryInsightInput[],
  ): Promise<string> {
    if (events.length === 0) {
      return `Account ${accountId} has no transaction history available.`;
    }

    const completed = events.filter((event) => event.status === TransactionStatus.COMPLETED).length;
    const rejected = events.filter((event) => event.status === TransactionStatus.REJECTED).length;
    const total = events.reduce((sum, event) => sum + event.amount, 0);
    const latest = events[events.length - 1];

    return `Account ${accountId} has ${events.length} tracked transactions: ${completed} completed and ${rejected} rejected. The cumulative moved amount is ${total.toFixed(2)}. Latest insight: ${latest.explanation}`;
  }
}
