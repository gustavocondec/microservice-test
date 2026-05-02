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
    TransactionsService,
    TransactionsEventsPublisher,
    DatabaseBootstrapService,
    ProcessedEventsService,
  ],
})
export class AppModule {}
