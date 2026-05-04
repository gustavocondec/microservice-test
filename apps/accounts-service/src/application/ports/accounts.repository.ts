export const ACCOUNTS_REPOSITORY = 'ACCOUNTS_REPOSITORY';
export const ACCOUNTS_UNIT_OF_WORK = 'ACCOUNTS_UNIT_OF_WORK';

export type AccountRecord = {
  id: string;
  clientId: string;
  currency: string;
  balance: number;
  createdAt: Date;
};

export type CreateAccountRecord = {
  id: string;
  clientId: string;
  currency: string;
  balance: number;
};

export interface AccountsRepository {
  create(input: CreateAccountRecord): Promise<AccountRecord>;
  findById(accountId: string): Promise<AccountRecord | null>;
  findByClientId(clientId: string): Promise<AccountRecord[]>;
}

export interface AccountsTransactionRepository {
  findById(accountId: string): Promise<AccountRecord | null>;
  saveAll(accounts: AccountRecord[]): Promise<void>;
}

export interface AccountsUnitOfWork {
  run<T>(handler: (repository: AccountsTransactionRepository) => Promise<T>): Promise<T>;
}
