import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { KafkaTopics, type AccountCreatedPayload, type DomainEvent } from '@app/contracts';
import { buildEventMetadata } from '@app/shared';
import { CreateAccountDto } from '../../infrastructure/http/dto/create-account.dto';
import { AccountEntity } from '../../infrastructure/persistence/entities/account.entity';
import { ClientEntity } from '../../infrastructure/persistence/entities/client.entity';
import { AccountsEventsPublisher } from '../../infrastructure/messaging/accounts-events.publisher';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    private readonly accountsEventsPublisher: AccountsEventsPublisher,
  ) {}

  async createAccount(dto: CreateAccountDto): Promise<AccountEntity> {
    const client = await this.clientRepository.findOne({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (dto.initialBalance < 0) {
      throw new BadRequestException('Initial balance cannot be negative');
    }

    const account = this.accountRepository.create({
      id: randomUUID(),
      clientId: dto.clientId,
      currency: dto.currency.toUpperCase(),
      balance: Number(dto.initialBalance ?? 0),
    });

    await this.accountRepository.save(account);

    const event: DomainEvent<AccountCreatedPayload> = {
      metadata: buildEventMetadata(KafkaTopics.AccountCreated, account.id),
      payload: {
        accountId: account.id,
        clientId: account.clientId,
        currency: account.currency,
        balance: account.balance,
      },
    };

    await this.accountsEventsPublisher.publish(KafkaTopics.AccountCreated, event);

    return account;
  }

  async getAccount(accountId: string): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({ where: { id: accountId } });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async listAccountsByClient(clientId: string): Promise<AccountEntity[]> {
    await this.ensureClientExists(clientId);

    return this.accountRepository.find({
      where: { clientId },
      order: { createdAt: 'ASC' },
    });
  }

  private async ensureClientExists(clientId: string): Promise<void> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });

    if (!client) {
      throw new NotFoundException('Client not found');
    }
  }
}
