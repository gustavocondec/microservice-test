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
const accounts_service_1 = require("./application/services/accounts.service");
const clients_service_1 = require("./application/services/clients.service");
const transaction_orchestrator_service_1 = require("./application/services/transaction-orchestrator.service");
const accounts_controller_1 = require("./infrastructure/http/accounts.controller");
const clients_controller_1 = require("./infrastructure/http/clients.controller");
const health_controller_1 = require("./infrastructure/http/health.controller");
const accounts_events_publisher_1 = require("./infrastructure/messaging/accounts-events.publisher");
const transactions_consumer_1 = require("./infrastructure/messaging/transactions.consumer");
const account_entity_1 = require("./infrastructure/persistence/entities/account.entity");
const client_entity_1 = require("./infrastructure/persistence/entities/client.entity");
const _1712700000000_init_accounts_1 = require("./infrastructure/persistence/migrations/1712700000000-init-accounts");
const shared_2 = require("../../../libs/shared/src");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => (0, shared_1.buildTypeOrmOptions)(configService, [client_entity_1.ClientEntity, account_entity_1.AccountEntity, shared_1.ProcessedEventEntity], [_1712700000000_init_accounts_1.InitAccounts1712700000000]),
            }),
            typeorm_1.TypeOrmModule.forFeature([client_entity_1.ClientEntity, account_entity_1.AccountEntity, shared_1.ProcessedEventEntity]),
            shared_2.KafkaClientsModule.register(accounts_events_publisher_1.ACCOUNTS_KAFKA_CLIENT, 'accounts-service-publisher'),
        ],
        controllers: [
            clients_controller_1.ClientsController,
            accounts_controller_1.AccountsController,
            health_controller_1.HealthController,
            transactions_consumer_1.TransactionsConsumerController,
        ],
        providers: [
            clients_service_1.ClientsService,
            accounts_service_1.AccountsService,
            transaction_orchestrator_service_1.TransactionOrchestratorService,
            accounts_events_publisher_1.AccountsEventsPublisher,
            shared_1.DatabaseBootstrapService,
            shared_1.ProcessedEventsService,
        ],
    })
], AppModule);
