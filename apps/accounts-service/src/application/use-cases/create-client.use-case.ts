import { randomUUID } from 'crypto';
import { KafkaTopics, type ClientCreatedPayload, type DomainEvent } from '@app/contracts';
import { Client } from '../../domain/entities/client';
import { DuplicateClientEmailError } from '../../domain/errors/duplicate-client-email.error';
import { type AccountsEventsPort } from '../ports/accounts-events.port';
import { type ClientsRepository } from '../ports/clients.repository';

export interface CreateClientInput {
  name: string;
  email: string;
}

export class CreateClientUseCase {
  constructor(
    private readonly clientRepository: ClientsRepository,
    private readonly accountsEventsPublisher: AccountsEventsPort,
  ) {}

  async execute(input: CreateClientInput): Promise<Client> {
    const email = input.email.toLowerCase();
    const existingClient = await this.clientRepository.findByEmail(email);

    if (existingClient) {
      throw new DuplicateClientEmailError();
    }

    const client = Client.create({
      id: randomUUID(),
      name: input.name,
      email,
    });
    const savedClient = await this.clientRepository.save(client);

    const event: DomainEvent<ClientCreatedPayload> = {
      metadata: {
        eventId: randomUUID(),
        eventType: KafkaTopics.ClientCreated,
        occurredAt: new Date().toISOString(),
        correlationId: savedClient.id,
      },
      payload: {
        clientId: savedClient.id,
        name: savedClient.name,
        email: savedClient.email,
      },
    };

    await this.accountsEventsPublisher.publish(KafkaTopics.ClientCreated, event);

    return savedClient;
  }
}
