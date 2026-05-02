import { TransactionRejectionCode } from '@app/contracts';

export class BusinessRuleError extends Error {
  constructor(
    public readonly code: TransactionRejectionCode,
    message: string,
  ) {
    super(message);
  }
}
