import { ClientNotFoundError } from '../../domain/errors/client-not-found.error';
import { type AccountRecord, type AccountsRepository } from '../ports/accounts.repository';
import { type ClientsRepository } from '../ports/clients.repository';

export class ListAccountsByClientUseCase {
  constructor(
    private readonly accountRepository: AccountsRepository,
    private readonly clientRepository: ClientsRepository,
  ) {}

  async execute(clientId: string): Promise<AccountRecord[]> {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new ClientNotFoundError();
    }

    return this.accountRepository.findByClientId(clientId);
  }
}
