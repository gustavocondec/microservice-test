"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const shared_1 = require("../../../libs/shared/src");
const processed_events_port_1 = require("./application/ports/processed-events.port");
const transactions_events_port_1 = require("./application/ports/transactions-events.port");
const transactions_repository_1 = require("./application/ports/transactions.repository");
const create_transaction_use_case_1 = require("./application/use-cases/create-transaction.use-case");
const get_transaction_use_case_1 = require("./application/use-cases/get-transaction.use-case");
const handle_transaction_completed_use_case_1 = require("./application/use-cases/handle-transaction-completed.use-case");
const handle_transaction_rejected_use_case_1 = require("./application/use-cases/handle-transaction-rejected.use-case");
const health_controller_1 = require("./infrastructure/http/health.controller");
const transactions_controller_1 = require("./infrastructure/http/transactions.controller");
const transactions_events_publisher_1 = require("./infrastructure/messaging/transactions-events.publisher");
const transactions_consumer_1 = require("./infrastructure/messaging/transactions.consumer");
const transaction_entity_1 = require("./infrastructure/persistence/entities/transaction.entity");
const _1712701000000_init_transactions_1 = require("./infrastructure/persistence/migrations/1712701000000-init-transactions");
const typeorm_transactions_repository_1 = require("./infrastructure/persistence/typeorm-transactions.repository");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => (0, shared_1.buildTypeOrmOptions)(configService, [transaction_entity_1.TransactionEntity, shared_1.ProcessedEventEntity], [_1712701000000_init_transactions_1.InitTransactions1712701000000]),
            }),
            typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.TransactionEntity, shared_1.ProcessedEventEntity]),
            shared_1.KafkaClientsModule.register(transactions_events_publisher_1.TRANSACTIONS_KAFKA_CLIENT, 'transactions-service-publisher'),
        ],
        controllers: [
            transactions_controller_1.TransactionsController,
            health_controller_1.HealthController,
            transactions_consumer_1.TransactionsEventsConsumerController,
        ],
        providers: [
            {
                provide: create_transaction_use_case_1.CreateTransactionUseCase,
                useFactory: (transactionRepository, transactionsEventsPublisher) => new create_transaction_use_case_1.CreateTransactionUseCase(transactionRepository, transactionsEventsPublisher),
                inject: [transactions_repository_1.TRANSACTIONS_REPOSITORY, transactions_events_port_1.TRANSACTIONS_EVENTS_PORT],
            },
            {
                provide: get_transaction_use_case_1.GetTransactionUseCase,
                useFactory: (transactionRepository) => new get_transaction_use_case_1.GetTransactionUseCase(transactionRepository),
                inject: [transactions_repository_1.TRANSACTIONS_REPOSITORY],
            },
            {
                provide: handle_transaction_completed_use_case_1.HandleTransactionCompletedUseCase,
                useFactory: (transactionRepository, processedEventsService, getTransactionUseCase) => new handle_transaction_completed_use_case_1.HandleTransactionCompletedUseCase(transactionRepository, processedEventsService, getTransactionUseCase),
                inject: [transactions_repository_1.TRANSACTIONS_REPOSITORY, processed_events_port_1.PROCESSED_EVENTS_PORT, get_transaction_use_case_1.GetTransactionUseCase],
            },
            {
                provide: handle_transaction_rejected_use_case_1.HandleTransactionRejectedUseCase,
                useFactory: (transactionRepository, processedEventsService, getTransactionUseCase) => new handle_transaction_rejected_use_case_1.HandleTransactionRejectedUseCase(transactionRepository, processedEventsService, getTransactionUseCase),
                inject: [transactions_repository_1.TRANSACTIONS_REPOSITORY, processed_events_port_1.PROCESSED_EVENTS_PORT, get_transaction_use_case_1.GetTransactionUseCase],
            },
            typeorm_transactions_repository_1.TypeOrmTransactionsRepository,
            transactions_events_publisher_1.TransactionsEventsPublisher,
            {
                provide: transactions_repository_1.TRANSACTIONS_REPOSITORY,
                useExisting: typeorm_transactions_repository_1.TypeOrmTransactionsRepository,
            },
            {
                provide: transactions_events_port_1.TRANSACTIONS_EVENTS_PORT,
                useExisting: transactions_events_publisher_1.TransactionsEventsPublisher,
            },
            {
                provide: processed_events_port_1.PROCESSED_EVENTS_PORT,
                useExisting: shared_1.ProcessedEventsService,
            },
            shared_1.DatabaseBootstrapService,
            shared_1.ProcessedEventsService,
        ],
    })
], AppModule);
