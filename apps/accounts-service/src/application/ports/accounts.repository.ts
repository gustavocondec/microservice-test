import { type Account } from '../../domain/entities/account';

export const ACCOUNTS_REPOSITORY = 'ACCOUNTS_REPOSITORY';
export const ACCOUNTS_UNIT_OF_WORK = 'ACCOUNTS_UNIT_OF_WORK';

export interface AccountsRepository {
  save(account: Account): Promise<Account>;
  findById(accountId: string): Promise<Account | null>;
  findByClientId(clientId: string): Promise<Account[]>;
}

export interface AccountsTransactionRepository {
  findById(accountId: string): Promise<Account | null>;
  saveAll(accounts: Account[]): Promise<void>;
}

export interface AccountsUnitOfWork {
  run<T>(handler: (repository: AccountsTransactionRepository) => Promise<T>): Promise<T>;
}
