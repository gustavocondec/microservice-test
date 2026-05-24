import {
  type TransactionRejectionCode,
  type TransactionStatus,
  type TransactionType,
} from '@app/contracts';

export interface AiInsightSnapshot {
  id: string;
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  reasonCode?: TransactionRejectionCode | null;
  explanation: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateAiInsightProps {
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

export class AiInsight {
  private constructor(private readonly props: AiInsightSnapshot) {}

  static create(props: CreateAiInsightProps): AiInsight {
    return new AiInsight({
      ...props,
      amount: Number(props.amount.toFixed(2)),
    });
  }

  static restore(snapshot: AiInsightSnapshot): AiInsight {
    return new AiInsight({ ...snapshot });
  }

  get id(): string {
    return this.props.id;
  }

  get transactionId(): string {
    return this.props.transactionId;
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

  get reasonCode(): TransactionRejectionCode | null | undefined {
    return this.props.reasonCode;
  }

  get explanation(): string {
    return this.props.explanation;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  toSnapshot(): AiInsightSnapshot {
    return { ...this.props };
  }

  toJSON(): AiInsightSnapshot {
    return this.toSnapshot();
  }
}
