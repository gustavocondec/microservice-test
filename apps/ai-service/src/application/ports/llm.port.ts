import {
  type TransactionRejectionCode,
  type TransactionStatus,
  type TransactionType,
} from '@app/contracts';

export interface ExplainTransactionInput {
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string;
  targetAccountId?: string;
  reasonCode?: TransactionRejectionCode;
  reasonMessage?: string;
}

export interface SummaryInsightInput {
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  explanation: string;
  createdAt: Date;
}

export const LLM_PORT = 'LLM_PORT';

export interface LlmPort {
  explainTransaction(input: ExplainTransactionInput): Promise<string>;
  summarizeAccountHistory(accountId: string, events: SummaryInsightInput[]): Promise<string>;
}
