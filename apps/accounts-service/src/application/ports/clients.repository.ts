export const CLIENTS_REPOSITORY = 'CLIENTS_REPOSITORY';

export type ClientRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export type CreateClientRecord = {
  id: string;
  name: string;
  email: string;
};

export interface ClientsRepository {
  create(input: CreateClientRecord): Promise<ClientRecord>;
  findAll(): Promise<ClientRecord[]>;
  findByEmail(email: string): Promise<ClientRecord | null>;
  findById(clientId: string): Promise<ClientRecord | null>;
}
