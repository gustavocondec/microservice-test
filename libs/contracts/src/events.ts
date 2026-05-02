import { TransactionRejectionCode, TransactionStatus, TransactionType } from './transactions';

export interface EventMetadata {
  eventId: string;
  eventType: string;
  occurredAt: string;
  correlationId: string;
}

export interface DomainEvent<TPayload> {
  metadata: EventMetadata;
  payload: TPayload;
}

export interface ClientCreatedPayload {
  clientId: string;
  name: string;
  email: string;
}

export interface AccountCreatedPayload {
  accountId: string;
  clientId: string;
  currency: string;
  balance: number;
}

export interface BalanceUpdatedPayload {
  accountId: string;
  clientId: string;
  balance: number;
  transactionId: string;
}

export interface TransactionRequestedPayload {
  transactionId: string;
  type: TransactionType;
  amount: number;
  sourceAccountId?: string;
  targetAccountId?: string;
  idempotencyKey: string;
  requestedAt: string;
}

export interface TransactionCompletedPayload {
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus.COMPLETED;
  amount: number;
  sourceAccountId?: string;
  targetAccountId?: string;
  completedAt: string;
}

export interface TransactionRejectedPayload {
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus.REJECTED;
  amount: number;
  sourceAccountId?: string;
  targetAccountId?: string;
  rejectedAt: string;
  reasonCode: TransactionRejectionCode;
  reasonMessage: string;
}
