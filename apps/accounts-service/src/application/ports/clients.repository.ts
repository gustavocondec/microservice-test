import { type Client } from '../../domain/entities/client';

export const CLIENTS_REPOSITORY = 'CLIENTS_REPOSITORY';

export interface ClientsRepository {
  save(client: Client): Promise<Client>;
  findAll(): Promise<Client[]>;
  findByEmail(email: string): Promise<Client | null>;
  findById(clientId: string): Promise<Client | null>;
}
