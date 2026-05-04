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
const accounts_events_port_1 = require("./application/ports/accounts-events.port");
const accounts_repository_1 = require("./application/ports/accounts.repository");
const clients_repository_1 = require("./application/ports/clients.repository");
const processed_events_port_1 = require("./application/ports/processed-events.port");
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
const typeorm_accounts_repository_1 = require("./infrastructure/persistence/typeorm-accounts.repository");
const typeorm_clients_repository_1 = require("./infrastructure/persistence/typeorm-clients.repository");
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
            shared_1.KafkaClientsModule.register(accounts_events_publisher_1.ACCOUNTS_KAFKA_CLIENT, 'accounts-service-publisher'),
        ],
        controllers: [
            clients_controller_1.ClientsController,
            accounts_controller_1.AccountsController,
            health_controller_1.HealthController,
            transactions_consumer_1.TransactionsConsumerController,
        ],
        providers: [
            {
                provide: clients_service_1.ClientsService,
                useFactory: (clientRepository, accountsEventsPublisher) => new clients_service_1.ClientsService(clientRepository, accountsEventsPublisher),
                inject: [clients_repository_1.CLIENTS_REPOSITORY, accounts_events_port_1.ACCOUNTS_EVENTS_PORT],
            },
            {
                provide: accounts_service_1.AccountsService,
                useFactory: (accountRepository, clientRepository, accountsEventsPublisher) => new accounts_service_1.AccountsService(accountRepository, clientRepository, accountsEventsPublisher),
                inject: [accounts_repository_1.ACCOUNTS_REPOSITORY, clients_repository_1.CLIENTS_REPOSITORY, accounts_events_port_1.ACCOUNTS_EVENTS_PORT],
            },
            {
                provide: transaction_orchestrator_service_1.TransactionOrchestratorService,
                useFactory: (accountsUnitOfWork, processedEventsService, accountsEventsPublisher) => new transaction_orchestrator_service_1.TransactionOrchestratorService(accountsUnitOfWork, processedEventsService, accountsEventsPublisher),
                inject: [accounts_repository_1.ACCOUNTS_UNIT_OF_WORK, processed_events_port_1.PROCESSED_EVENTS_PORT, accounts_events_port_1.ACCOUNTS_EVENTS_PORT],
            },
            typeorm_clients_repository_1.TypeOrmClientsRepository,
            typeorm_accounts_repository_1.TypeOrmAccountsRepository,
            accounts_events_publisher_1.AccountsEventsPublisher,
            {
                provide: clients_repository_1.CLIENTS_REPOSITORY,
                useExisting: typeorm_clients_repository_1.TypeOrmClientsRepository,
            },
            {
                provide: accounts_repository_1.ACCOUNTS_REPOSITORY,
                useExisting: typeorm_accounts_repository_1.TypeOrmAccountsRepository,
            },
            {
                provide: accounts_repository_1.ACCOUNTS_UNIT_OF_WORK,
                useExisting: typeorm_accounts_repository_1.TypeOrmAccountsRepository,
            },
            {
                provide: accounts_events_port_1.ACCOUNTS_EVENTS_PORT,
                useExisting: accounts_events_publisher_1.AccountsEventsPublisher,
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
