import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type ClientsRepository } from '../../application/ports/clients.repository';
import { Client } from '../../domain/entities/client';
import { ClientEntity } from './entities/client.entity';

@Injectable()
export class TypeOrmClientsRepository implements ClientsRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async save(input: Client): Promise<Client> {
    const client = this.clientRepository.create(input.toSnapshot());
    const savedClient = await this.clientRepository.save(client);

    return this.toDomain(savedClient);
  }

  async findAll(): Promise<Client[]> {
    const clients = await this.clientRepository.find({
      order: { createdAt: 'ASC' },
    });

    return clients.map((client) => this.toDomain(client));
  }

  async findByEmail(email: string): Promise<Client | null> {
    const client = await this.clientRepository.findOne({ where: { email } });

    return client ? this.toDomain(client) : null;
  }

  async findById(clientId: string): Promise<Client | null> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });

    return client ? this.toDomain(client) : null;
  }

  private toDomain(client: ClientEntity): Client {
    return Client.restore({
      id: client.id,
      name: client.name,
      email: client.email,
      createdAt: client.createdAt,
    });
  }
}
