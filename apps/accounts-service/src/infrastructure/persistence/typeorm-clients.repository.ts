import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type ClientRecord,
  type ClientsRepository,
  type CreateClientRecord,
} from '../../application/ports/clients.repository';
import { ClientEntity } from './entities/client.entity';

@Injectable()
export class TypeOrmClientsRepository implements ClientsRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async create(input: CreateClientRecord): Promise<ClientRecord> {
    const client = this.clientRepository.create(input);
    const savedClient = await this.clientRepository.save(client);

    return this.toRecord(savedClient);
  }

  async findAll(): Promise<ClientRecord[]> {
    const clients = await this.clientRepository.find({
      order: { createdAt: 'ASC' },
    });

    return clients.map((client) => this.toRecord(client));
  }

  async findByEmail(email: string): Promise<ClientRecord | null> {
    const client = await this.clientRepository.findOne({ where: { email } });

    return client ? this.toRecord(client) : null;
  }

  async findById(clientId: string): Promise<ClientRecord | null> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });

    return client ? this.toRecord(client) : null;
  }

  private toRecord(client: ClientEntity): ClientRecord {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      createdAt: client.createdAt,
    };
  }
}
