import { randomUUID } from 'crypto';
import { KafkaTopics, type AccountCreatedPayload, type DomainEvent } from '@app/contracts';
import { ClientNotFoundError } from '../../domain/errors/client-not-found.error';
import { Account } from '../../domain/entities/account';
import { type AccountsEventsPort } from '../ports/accounts-events.port';
import { type AccountsRepository } from '../ports/accounts.repository';
import { type ClientsRepository } from '../ports/clients.repository';

export interface CreateAccountInput {
  clientId: string;
  currency: string;
  initialBalance: number;
}

export class CreateAccountUseCase {
  constructor(
    private readonly accountRepository: AccountsRepository,
    private readonly clientRepository: ClientsRepository,
    private readonly accountsEventsPublisher: AccountsEventsPort,
  ) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    const client = await this.clientRepository.findById(input.clientId);

    if (!client) {
      throw new ClientNotFoundError();
    }

    const account = Account.create({
      id: randomUUID(),
      clientId: input.clientId,
      currency: input.currency,
      initialBalance: input.initialBalance,
    });
    const savedAccount = await this.accountRepository.save(account);

    const event: DomainEvent<AccountCreatedPayload> = {
      metadata: {
        eventId: randomUUID(),
        eventType: KafkaTopics.AccountCreated,
        occurredAt: new Date().toISOString(),
        correlationId: savedAccount.id,
      },
      payload: {
        accountId: savedAccount.id,
        clientId: savedAccount.clientId,
        currency: savedAccount.currency,
        balance: savedAccount.balance,
      },
    };

    await this.accountsEventsPublisher.publish(KafkaTopics.AccountCreated, event);

    return savedAccount;
  }
}
