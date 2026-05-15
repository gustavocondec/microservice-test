import { type TransactionRejectionCode, TransactionStatus, TransactionType } from '@app/contracts';
import { InvalidTransactionError } from '../errors/invalid-transaction.error';

export interface TransactionSnapshot {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  idempotencyKey: string;
  rejectionCode?: TransactionRejectionCode | null;
  rejectionMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTransactionProps {
  id: string;
  type: TransactionType;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  idempotencyKey: string;
}

export class Transaction {
  private constructor(private readonly props: TransactionSnapshot) {}

  static create(props: CreateTransactionProps): Transaction {
    this.validateRequest(props);

    return new Transaction({
      id: props.id,
      type: props.type,
      status: TransactionStatus.PENDING,
      amount: Number(props.amount.toFixed(2)),
      sourceAccountId: props.sourceAccountId ?? null,
      targetAccountId: props.targetAccountId ?? null,
      idempotencyKey: props.idempotencyKey,
      rejectionCode: null,
      rejectionMessage: null,
    });
  }

  static restore(snapshot: TransactionSnapshot): Transaction {
    return new Transaction({ ...snapshot });
  }

  get id(): string {
    return this.props.id;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get amount(): number {
    return this.props.amount;
  }

  get sourceAccountId(): string | null | undefined {
    return this.props.sourceAccountId;
  }

  get targetAccountId(): string | null | undefined {
    return this.props.targetAccountId;
  }

  get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }

  get rejectionCode(): TransactionRejectionCode | null | undefined {
    return this.props.rejectionCode;
  }

  get rejectionMessage(): string | null | undefined {
    return this.props.rejectionMessage;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  complete(): void {
    this.props.status = TransactionStatus.COMPLETED;
    this.props.rejectionCode = null;
    this.props.rejectionMessage = null;
  }

  reject(reasonCode: TransactionRejectionCode, reasonMessage: string): void {
    this.props.status = TransactionStatus.REJECTED;
    this.props.rejectionCode = reasonCode;
    this.props.rejectionMessage = reasonMessage;
  }

  toSnapshot(): TransactionSnapshot {
    return { ...this.props };
  }

  toJSON(): TransactionSnapshot {
    return this.toSnapshot();
  }

  private static validateRequest(props: CreateTransactionProps): void {
    if (props.amount <= 0) {
      throw new InvalidTransactionError('Transactions require a positive amount');
    }

    switch (props.type) {
      case TransactionType.DEPOSIT:
        if (!props.targetAccountId) {
          throw new InvalidTransactionError('Deposits require a target account');
        }
        break;
      case TransactionType.WITHDRAW:
        if (!props.sourceAccountId) {
          throw new InvalidTransactionError('Withdrawals require a source account');
        }
        break;
      case TransactionType.TRANSFER:
        if (!props.sourceAccountId || !props.targetAccountId) {
          throw new InvalidTransactionError('Transfers require source and target accounts');
        }
        if (props.sourceAccountId === props.targetAccountId) {
          throw new InvalidTransactionError('Transfers require different accounts');
        }
        break;
      default:
        throw new InvalidTransactionError('Unsupported transaction type');
    }
  }
}
