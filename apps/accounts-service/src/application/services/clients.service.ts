import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { KafkaTopics, type ClientCreatedPayload, type DomainEvent } from '@app/contracts';
import { buildEventMetadata } from '@app/shared';
import { CreateClientDto } from '../../infrastructure/http/dto/create-client.dto';
import { ClientEntity } from '../../infrastructure/persistence/entities/client.entity';
import { AccountsEventsPublisher } from '../../infrastructure/messaging/accounts-events.publisher';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    private readonly accountsEventsPublisher: AccountsEventsPublisher,
  ) {}

  async createClient(dto: CreateClientDto): Promise<ClientEntity> {
    const existingClient = await this.clientRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingClient) {
      throw new ConflictException('A client with the same email already exists');
    }

    const client = this.clientRepository.create({
      id: randomUUID(),
      name: dto.name,
      email: dto.email.toLowerCase(),
    });

    await this.clientRepository.save(client);

    const event: DomainEvent<ClientCreatedPayload> = {
      metadata: buildEventMetadata(KafkaTopics.ClientCreated, client.id),
      payload: {
        clientId: client.id,
        name: client.name,
        email: client.email,
      },
    };

    await this.accountsEventsPublisher.publish(KafkaTopics.ClientCreated, event);

    return client;
  }

  async listClients(): Promise<ClientEntity[]> {
    return this.clientRepository.find({
      order: { createdAt: 'ASC' },
    });
  }
}
