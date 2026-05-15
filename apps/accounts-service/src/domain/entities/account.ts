import { TransactionRejectionCode } from '@app/contracts';
import { BusinessRuleError } from '../errors/business-rule.error';
import { InvalidInitialBalanceError } from '../errors/invalid-initial-balance.error';

export type AccountSnapshot = {
  id: string;
  clientId: string;
  currency: string;
  balance: number;
  createdAt?: Date;
};

export type CreateAccountProps = {
  id: string;
  clientId: string;
  currency: string;
  initialBalance: number;
};

export class Account {
  private constructor(
    private readonly props: AccountSnapshot,
  ) {}

  static create(props: CreateAccountProps): Account {
    if (props.initialBalance < 0) {
      throw new InvalidInitialBalanceError();
    }

    return new Account({
      id: props.id,
      clientId: props.clientId,
      currency: props.currency.toUpperCase(),
      balance: Number(props.initialBalance.toFixed(2)),
    });
  }

  static restore(snapshot: AccountSnapshot): Account {
    return new Account({ ...snapshot });
  }

  get id(): string {
    return this.props.id;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get currency(): string {
    return this.props.currency;
  }

  get balance(): number {
    return this.props.balance;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  deposit(amount: number): void {
    this.ensurePositiveAmount(amount);
    this.props.balance = Number((this.props.balance + amount).toFixed(2));
  }

  withdraw(amount: number): void {
    this.ensurePositiveAmount(amount);

    if (this.props.balance < amount) {
      throw new BusinessRuleError(
        TransactionRejectionCode.INSUFFICIENT_FUNDS,
        `Account ${this.id} does not have enough funds`,
      );
    }

    this.props.balance = Number((this.props.balance - amount).toFixed(2));
  }

  toSnapshot(): AccountSnapshot {
    return { ...this.props };
  }

  toJSON(): AccountSnapshot {
    return this.toSnapshot();
  }

  private ensurePositiveAmount(amount: number): void {
    if (amount <= 0) {
      throw new BusinessRuleError(
        TransactionRejectionCode.INVALID_REQUEST,
        'Transaction amount must be positive',
      );
    }
  }
}
