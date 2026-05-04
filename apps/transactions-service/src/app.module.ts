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
import { PROCESSED_EVENTS_PORT } from './application/ports/processed-events.port';
import { TRANSACTIONS_EVENTS_PORT } from './application/ports/transactions-events.port';
import { TRANSACTIONS_REPOSITORY } from './application/ports/transactions.repository';
import { TransactionsService } from './application/services/transactions.service';
import { HealthController } from './infrastructure/http/health.controller';
import { TransactionsController } from './infrastructure/http/transactions.controller';
import {
  TRANSACTIONS_KAFKA_CLIENT,
  TransactionsEventsPublisher,
} from './infrastructure/messaging/transactions-events.publisher';
import { TransactionsEventsConsumerController } from './infrastructure/messaging/transactions.consumer';
import { TransactionEntity } from './infrastructure/persistence/entities/transaction.entity';
import { InitTransactions1712701000000 } from './infrastructure/persistence/migrations/1712701000000-init-transactions';
import { TypeOrmTransactionsRepository } from './infrastructure/persistence/typeorm-transactions.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildTypeOrmOptions(
          configService,
          [TransactionEntity, ProcessedEventEntity],
          [InitTransactions1712701000000],
        ),
    }),
    TypeOrmModule.forFeature([TransactionEntity, ProcessedEventEntity]),
    KafkaClientsModule.register(TRANSACTIONS_KAFKA_CLIENT, 'transactions-service-publisher'),
  ],
  controllers: [
    TransactionsController,
    HealthController,
    TransactionsEventsConsumerController,
  ],
  providers: [
    {
      provide: TransactionsService,
      useFactory: (transactionRepository, processedEventsService, transactionsEventsPublisher) =>
        new TransactionsService(
          transactionRepository,
          processedEventsService,
          transactionsEventsPublisher,
        ),
      inject: [TRANSACTIONS_REPOSITORY, PROCESSED_EVENTS_PORT, TRANSACTIONS_EVENTS_PORT],
    },
    TypeOrmTransactionsRepository,
    TransactionsEventsPublisher,
    {
      provide: TRANSACTIONS_REPOSITORY,
      useExisting: TypeOrmTransactionsRepository,
    },
    {
      provide: TRANSACTIONS_EVENTS_PORT,
      useExisting: TransactionsEventsPublisher,
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
