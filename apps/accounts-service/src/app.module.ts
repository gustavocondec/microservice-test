import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  buildTypeOrmOptions,
  DatabaseBootstrapService,
  ProcessedEventEntity,
  ProcessedEventsService,
} from '@app/shared';
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
import { KafkaClientsModule } from '@app/shared';

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
    ClientsService,
    AccountsService,
    TransactionOrchestratorService,
    AccountsEventsPublisher,
    DatabaseBootstrapService,
    ProcessedEventsService,
  ],
})
export class AppModule {}
