import { randomUUID } from 'crypto';
import { KafkaTopics, type AccountCreatedPayload, type DomainEvent } from '@app/contracts';
import { AccountNotFoundError } from '../../domain/errors/account-not-found.error';
import { ClientNotFoundError } from '../../domain/errors/client-not-found.error';
import { InvalidInitialBalanceError } from '../../domain/errors/invalid-initial-balance.error';
import { type AccountsEventsPort } from '../ports/accounts-events.port';
import { type AccountRecord, type AccountsRepository } from '../ports/accounts.repository';
import { type ClientsRepository } from '../ports/clients.repository';

export type CreateAccountInput = {
  clientId: string;
  currency: string;
  initialBalance: number;
};

export class AccountsService {
  constructor(
    private readonly accountRepository: AccountsRepository,
    private readonly clientRepository: ClientsRepository,
    private readonly accountsEventsPublisher: AccountsEventsPort,
  ) {}

  async createAccount(input: CreateAccountInput): Promise<AccountRecord> {
    const client = await this.clientRepository.findById(input.clientId);

    if (!client) {
      throw new ClientNotFoundError();
    }

    if (input.initialBalance < 0) {
      throw new InvalidInitialBalanceError();
    }

    const account = await this.accountRepository.create({
      id: randomUUID(),
      clientId: input.clientId,
      currency: input.currency.toUpperCase(),
      balance: Number(input.initialBalance ?? 0),
    });

    const event: DomainEvent<AccountCreatedPayload> = {
      metadata: {
        eventId: randomUUID(),
        eventType: KafkaTopics.AccountCreated,
        occurredAt: new Date().toISOString(),
        correlationId: account.id,
      },
      payload: {
        accountId: account.id,
        clientId: account.clientId,
        currency: account.currency,
        balance: account.balance,
      },
    };

    await this.accountsEventsPublisher.publish(KafkaTopics.AccountCreated, event);

    return account;
  }

  async getAccount(accountId: string): Promise<AccountRecord> {
    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    return account;
  }

  async listAccountsByClient(clientId: string): Promise<AccountRecord[]> {
    await this.ensureClientExists(clientId);

    return this.accountRepository.findByClientId(clientId);
  }

  private async ensureClientExists(clientId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new ClientNotFoundError();
    }
  }
}
