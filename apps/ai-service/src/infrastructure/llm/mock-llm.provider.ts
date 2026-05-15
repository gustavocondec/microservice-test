import { Injectable } from '@nestjs/common';
import { TransactionStatus, TransactionType } from '@app/contracts';
import {
  type ExplainTransactionInput,
  type LlmPort,
  type SummaryInsightInput,
} from '../../application/ports/llm.port';

@Injectable()
export class MockLlmProvider implements LlmPort {
  explainTransaction(input: ExplainTransactionInput): Promise<string> {
    if (input.status === TransactionStatus.REJECTED) {
      return Promise.resolve(
        `Transaction ${input.transactionId} was rejected because ${
          input.reasonMessage?.toLowerCase() ?? 'an unspecified reason'
        }.`,
      );
    }

    switch (input.type) {
      case TransactionType.DEPOSIT:
        return Promise.resolve(
          `Deposit ${input.transactionId} completed successfully for ${input.amount.toFixed(
            2,
          )} into account ${input.targetAccountId ?? 'unknown account'}.`,
        );
      case TransactionType.WITHDRAW:
        return Promise.resolve(
          `Withdrawal ${input.transactionId} completed successfully for ${input.amount.toFixed(
            2,
          )} from account ${input.sourceAccountId ?? 'unknown account'}.`,
        );
      case TransactionType.TRANSFER:
        return Promise.resolve(
          `Transfer ${input.transactionId} completed successfully for ${input.amount.toFixed(
            2,
          )} from account ${input.sourceAccountId ?? 'unknown account'} to account ${
            input.targetAccountId ?? 'unknown account'
          }.`,
        );
      default:
        return Promise.resolve(`Transaction ${input.transactionId} completed successfully.`);
    }
  }

  summarizeAccountHistory(accountId: string, events: SummaryInsightInput[]): Promise<string> {
    if (events.length === 0) {
      return Promise.resolve(`Account ${accountId} has no transaction history available.`);
    }

    const completed = events.filter((event) => event.status === TransactionStatus.COMPLETED).length;
    const rejected = events.filter((event) => event.status === TransactionStatus.REJECTED).length;
    const total = events.reduce((sum, event) => sum + event.amount, 0);
    const latest = events[events.length - 1];

    return Promise.resolve(
      `Account ${accountId} has ${String(events.length)} tracked transactions: ${String(
        completed,
      )} completed and ${String(rejected)} rejected. The cumulative moved amount is ${total.toFixed(
        2,
      )}. Latest insight: ${latest.explanation}`,
    );
  }
}
