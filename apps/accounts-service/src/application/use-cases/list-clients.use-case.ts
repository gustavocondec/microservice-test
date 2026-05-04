import { type ClientRecord, type ClientsRepository } from '../ports/clients.repository';

export class ListClientsUseCase {
  constructor(private readonly clientRepository: ClientsRepository) {}

  async execute(): Promise<ClientRecord[]> {
    return this.clientRepository.findAll();
  }
}
