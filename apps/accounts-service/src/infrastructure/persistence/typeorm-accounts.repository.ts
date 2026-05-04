import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  type AccountRecord,
  type AccountsRepository,
  type AccountsTransactionRepository,
  type AccountsUnitOfWork,
  type CreateAccountRecord,
} from '../../application/ports/accounts.repository';
import { AccountEntity } from './entities/account.entity';

@Injectable()
export class TypeOrmAccountsRepository implements AccountsRepository, AccountsUnitOfWork {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async create(input: CreateAccountRecord): Promise<AccountRecord> {
    const account = this.accountRepository.create(input);
    const savedAccount = await this.accountRepository.save(account);

    return this.toRecord(savedAccount);
  }

  async findById(accountId: string): Promise<AccountRecord | null> {
    const account = await this.accountRepository.findOne({ where: { id: accountId } });

    return account ? this.toRecord(account) : null;
  }

  async findByClientId(clientId: string): Promise<AccountRecord[]> {
    const accounts = await this.accountRepository.find({
      where: { clientId },
      order: { createdAt: 'ASC' },
    });

    return accounts.map((account) => this.toRecord(account));
  }

  async run<T>(handler: (repository: AccountsTransactionRepository) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => handler(this.createTransactionRepository(manager)));
  }

  private createTransactionRepository(manager: EntityManager): AccountsTransactionRepository {
    const repository = manager.getRepository(AccountEntity);

    return {
      findById: async (accountId) => {
        const account = await repository.findOne({ where: { id: accountId } });

        return account ? this.toRecord(account) : null;
      },
      saveAll: async (accounts) => {
        await repository.save(accounts.map((account) => repository.create(account)));
      },
    };
  }

  private toRecord(account: AccountEntity): AccountRecord {
    return {
      id: account.id,
      clientId: account.clientId,
      currency: account.currency,
      balance: account.balance,
      createdAt: account.createdAt,
    };
  }
}
