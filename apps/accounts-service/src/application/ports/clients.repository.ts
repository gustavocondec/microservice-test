export const CLIENTS_REPOSITORY = 'CLIENTS_REPOSITORY';

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CreateClientRecord {
  id: string;
  name: string;
  email: string;
}

export interface ClientsRepository {
  create(input: CreateClientRecord): Promise<ClientRecord>;
  findAll(): Promise<ClientRecord[]>;
  findByEmail(email: string): Promise<ClientRecord | null>;
  findById(clientId: string): Promise<ClientRecord | null>;
}
