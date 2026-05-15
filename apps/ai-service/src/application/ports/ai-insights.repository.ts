import {
  type TransactionRejectionCode,
  type TransactionStatus,
  type TransactionType,
} from '@app/contracts';

export const AI_INSIGHTS_REPOSITORY = 'AI_INSIGHTS_REPOSITORY';

export interface AiInsightRecord {
  id: string;
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  reasonCode?: TransactionRejectionCode | null;
  explanation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertAiInsightRecord {
  id: string;
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  reasonCode?: TransactionRejectionCode | null;
  explanation: string;
}

export interface AiInsightsRepository {
  findByAccountId(accountId: string): Promise<AiInsightRecord[]>;
  findByTransactionId(transactionId: string): Promise<AiInsightRecord | null>;
  upsertByTransactionId(input: UpsertAiInsightRecord): Promise<void>;
}
