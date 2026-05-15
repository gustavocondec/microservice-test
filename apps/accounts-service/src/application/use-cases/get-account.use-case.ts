import { AccountNotFoundError } from '../../domain/errors/account-not-found.error';
import { type Account } from '../../domain/entities/account';
import { type AccountsRepository } from '../ports/accounts.repository';

export class GetAccountUseCase {
  constructor(private readonly accountRepository: AccountsRepository) {}

  async execute(accountId: string): Promise<Account> {
    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    return account;
  }
}
