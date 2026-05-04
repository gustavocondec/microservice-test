import { randomUUID } from 'crypto';
import { KafkaTopics, type ClientCreatedPayload, type DomainEvent } from '@app/contracts';
import { DuplicateClientEmailError } from '../../domain/errors/duplicate-client-email.error';
import { type AccountsEventsPort } from '../ports/accounts-events.port';
import { type ClientRecord, type ClientsRepository } from '../ports/clients.repository';

export type CreateClientInput = {
  name: string;
  email: string;
};

export class CreateClientUseCase {
  constructor(
    private readonly clientRepository: ClientsRepository,
    private readonly accountsEventsPublisher: AccountsEventsPort,
  ) {}

  async execute(input: CreateClientInput): Promise<ClientRecord> {
    const email = input.email.toLowerCase();
    const existingClient = await this.clientRepository.findByEmail(email);

    if (existingClient) {
      throw new DuplicateClientEmailError();
    }

    const client = await this.clientRepository.create({
      id: randomUUID(),
      name: input.name,
      email,
    });

    const event: DomainEvent<ClientCreatedPayload> = {
      metadata: {
        eventId: randomUUID(),
        eventType: KafkaTopics.ClientCreated,
        occurredAt: new Date().toISOString(),
        correlationId: client.id,
      },
      payload: {
        clientId: client.id,
        name: client.name,
        email: client.email,
      },
    };

    await this.accountsEventsPublisher.publish(KafkaTopics.ClientCreated, event);

    return client;
  }
}
