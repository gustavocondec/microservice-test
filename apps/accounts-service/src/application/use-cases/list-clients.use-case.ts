import { type Client } from '../../domain/entities/client';
import { type ClientsRepository } from '../ports/clients.repository';

export class ListClientsUseCase {
  constructor(private readonly clientRepository: ClientsRepository) {}

  async execute(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }
}
