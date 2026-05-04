import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  buildTypeOrmOptions,
  DatabaseBootstrapService,
  KafkaClientsModule,
  ProcessedEventEntity,
  ProcessedEventsService,
} from '@app/shared';
import { ACCOUNTS_EVENTS_PORT } from './application/ports/accounts-events.port';
import {
  ACCOUNTS_REPOSITORY,
  ACCOUNTS_UNIT_OF_WORK,
} from './application/ports/accounts.repository';
import { CLIENTS_REPOSITORY } from './application/ports/clients.repository';
import { PROCESSED_EVENTS_PORT } from './application/ports/processed-events.port';
import { AccountsService } from './application/services/accounts.service';
import { ClientsService } from './application/services/clients.service';
import { TransactionOrchestratorService } from './application/services/transaction-orchestrator.service';
import { AccountsController } from './infrastructure/http/accounts.controller';
import { ClientsController } from './infrastructure/http/clients.controller';
import { HealthController } from './infrastructure/http/health.controller';
import {
  ACCOUNTS_KAFKA_CLIENT,
  AccountsEventsPublisher,
} from './infrastructure/messaging/accounts-events.publisher';
import { TransactionsConsumerController } from './infrastructure/messaging/transactions.consumer';
import { AccountEntity } from './infrastructure/persistence/entities/account.entity';
import { ClientEntity } from './infrastructure/persistence/entities/client.entity';
import { InitAccounts1712700000000 } from './infrastructure/persistence/migrations/1712700000000-init-accounts';
import { TypeOrmAccountsRepository } from './infrastructure/persistence/typeorm-accounts.repository';
import { TypeOrmClientsRepository } from './infrastructure/persistence/typeorm-clients.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildTypeOrmOptions(
          configService,
          [ClientEntity, AccountEntity, ProcessedEventEntity],
          [InitAccounts1712700000000],
        ),
    }),
    TypeOrmModule.forFeature([ClientEntity, AccountEntity, ProcessedEventEntity]),
    KafkaClientsModule.register(ACCOUNTS_KAFKA_CLIENT, 'accounts-service-publisher'),
  ],
  controllers: [
    ClientsController,
    AccountsController,
    HealthController,
    TransactionsConsumerController,
  ],
  providers: [
    {
      provide: ClientsService,
      useFactory: (clientRepository, accountsEventsPublisher) =>
        new ClientsService(clientRepository, accountsEventsPublisher),
      inject: [CLIENTS_REPOSITORY, ACCOUNTS_EVENTS_PORT],
    },
    {
      provide: AccountsService,
      useFactory: (accountRepository, clientRepository, accountsEventsPublisher) =>
        new AccountsService(accountRepository, clientRepository, accountsEventsPublisher),
      inject: [ACCOUNTS_REPOSITORY, CLIENTS_REPOSITORY, ACCOUNTS_EVENTS_PORT],
    },
    {
      provide: TransactionOrchestratorService,
      useFactory: (accountsUnitOfWork, processedEventsService, accountsEventsPublisher) =>
        new TransactionOrchestratorService(
          accountsUnitOfWork,
          processedEventsService,
          accountsEventsPublisher,
        ),
      inject: [ACCOUNTS_UNIT_OF_WORK, PROCESSED_EVENTS_PORT, ACCOUNTS_EVENTS_PORT],
    },
    TypeOrmClientsRepository,
    TypeOrmAccountsRepository,
    AccountsEventsPublisher,
    {
      provide: CLIENTS_REPOSITORY,
      useExisting: TypeOrmClientsRepository,
    },
    {
      provide: ACCOUNTS_REPOSITORY,
      useExisting: TypeOrmAccountsRepository,
    },
    {
      provide: ACCOUNTS_UNIT_OF_WORK,
      useExisting: TypeOrmAccountsRepository,
    },
    {
      provide: ACCOUNTS_EVENTS_PORT,
      useExisting: AccountsEventsPublisher,
    },
    {
      provide: PROCESSED_EVENTS_PORT,
      useExisting: ProcessedEventsService,
    },
    DatabaseBootstrapService,
    ProcessedEventsService,
  ],
})
export class AppModule {}
