import { TransactionRejectionCode, TransactionStatus, TransactionType } from '@app/contracts';

export type ExplainTransactionInput = {
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string;
  targetAccountId?: string;
  reasonCode?: TransactionRejectionCode;
  reasonMessage?: string;
};

export type SummaryInsightInput = {
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  explanation: string;
  createdAt: Date;
};

export const LLM_PORT = 'LLM_PORT';

export interface LlmPort {
  explainTransaction(input: ExplainTransactionInput): Promise<string>;
  summarizeAccountHistory(accountId: string, events: SummaryInsightInput[]): Promise<string>;
}
