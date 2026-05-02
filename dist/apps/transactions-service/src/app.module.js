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
const transactions_service_1 = require("./application/services/transactions.service");
const health_controller_1 = require("./infrastructure/http/health.controller");
const transactions_controller_1 = require("./infrastructure/http/transactions.controller");
const transactions_events_publisher_1 = require("./infrastructure/messaging/transactions-events.publisher");
const transactions_consumer_1 = require("./infrastructure/messaging/transactions.consumer");
const transaction_entity_1 = require("./infrastructure/persistence/entities/transaction.entity");
const _1712701000000_init_transactions_1 = require("./infrastructure/persistence/migrations/1712701000000-init-transactions");
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
            transactions_service_1.TransactionsService,
            transactions_events_publisher_1.TransactionsEventsPublisher,
            shared_1.DatabaseBootstrapService,
            shared_1.ProcessedEventsService,
        ],
    })
], AppModule);
