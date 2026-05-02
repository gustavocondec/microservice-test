"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransactionOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contracts_1 = require("../../../../../libs/contracts/src");
const shared_1 = require("../../../../../libs/shared/src");
const business_rule_error_1 = require("../../domain/errors/business-rule.error");
const accounts_events_publisher_1 = require("../../infrastructure/messaging/accounts-events.publisher");
const account_entity_1 = require("../../infrastructure/persistence/entities/account.entity");
let TransactionOrchestratorService = TransactionOrchestratorService_1 = class TransactionOrchestratorService {
    constructor(dataSource, accountRepository, processedEventsService, accountsEventsPublisher) {
        this.dataSource = dataSource;
        this.accountRepository = accountRepository;
        this.processedEventsService = processedEventsService;
        this.accountsEventsPublisher = accountsEventsPublisher;
        this.logger = new common_1.Logger(TransactionOrchestratorService_1.name);
    }
    async handleTransactionRequested(event) {
        if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
            this.logger.warn(`Skipping already processed event ${event.metadata.eventId}`);
            return;
        }
        let result;
        try {
            result = await this.applyTransaction(event);
        }
        catch (error) {
            if (!(error instanceof business_rule_error_1.BusinessRuleError)) {
                throw error;
            }
            result = {
                balanceEvents: [],
                finalEvent: {
                    metadata: (0, shared_1.buildEventMetadata)(contracts_1.KafkaTopics.TransactionRejected, event.metadata.correlationId),
                    payload: {
                        transactionId: event.payload.transactionId,
                        type: event.payload.type,
                        status: contracts_1.TransactionStatus.REJECTED,
                        amount: event.payload.amount,
                        sourceAccountId: event.payload.sourceAccountId,
                        targetAccountId: event.payload.targetAccountId,
                        rejectedAt: new Date().toISOString(),
                        reasonCode: error.code,
                        reasonMessage: error.message,
                    },
                },
            };
        }
        for (const balanceEvent of result.balanceEvents) {
            await this.accountsEventsPublisher.publish(contracts_1.KafkaTopics.BalanceUpdated, balanceEvent);
        }
        if ('completedAt' in result.finalEvent.payload) {
            const completedEvent = result.finalEvent;
            await this.accountsEventsPublisher.publish(contracts_1.KafkaTopics.TransactionCompleted, completedEvent);
        }
        else {
            const rejectedEvent = result.finalEvent;
            await this.accountsEventsPublisher.publish(contracts_1.KafkaTopics.TransactionRejected, rejectedEvent);
        }
        await this.processedEventsService.markProcessed(event.metadata.eventId, event.metadata.eventType);
    }
    async applyTransaction(event) {
        return this.dataSource.transaction(async (manager) => {
            const accountRepository = manager.getRepository(account_entity_1.AccountEntity);
            const payload = event.payload;
            const accountsToPersist = [];
            const balanceEvents = [];
            switch (payload.type) {
                case contracts_1.TransactionType.DEPOSIT: {
                    const targetAccount = await this.findRequiredAccount(accountRepository, payload.targetAccountId);
                    targetAccount.balance = Number((targetAccount.balance + payload.amount).toFixed(2));
                    accountsToPersist.push(targetAccount);
                    balanceEvents.push(this.createBalanceEvent(targetAccount, payload.transactionId, event.metadata.correlationId));
                    break;
                }
                case contracts_1.TransactionType.WITHDRAW: {
                    const sourceAccount = await this.findRequiredAccount(accountRepository, payload.sourceAccountId);
                    this.ensureFunds(sourceAccount, payload.amount);
                    sourceAccount.balance = Number((sourceAccount.balance - payload.amount).toFixed(2));
                    accountsToPersist.push(sourceAccount);
                    balanceEvents.push(this.createBalanceEvent(sourceAccount, payload.transactionId, event.metadata.correlationId));
                    break;
                }
                case contracts_1.TransactionType.TRANSFER: {
                    const sourceAccount = await this.findRequiredAccount(accountRepository, payload.sourceAccountId);
                    const targetAccount = await this.findRequiredAccount(accountRepository, payload.targetAccountId);
                    this.ensureFunds(sourceAccount, payload.amount);
                    sourceAccount.balance = Number((sourceAccount.balance - payload.amount).toFixed(2));
                    targetAccount.balance = Number((targetAccount.balance + payload.amount).toFixed(2));
                    accountsToPersist.push(sourceAccount, targetAccount);
                    balanceEvents.push(this.createBalanceEvent(sourceAccount, payload.transactionId, event.metadata.correlationId), this.createBalanceEvent(targetAccount, payload.transactionId, event.metadata.correlationId));
                    break;
                }
                default:
                    throw new business_rule_error_1.BusinessRuleError(contracts_1.TransactionRejectionCode.INVALID_REQUEST, 'Unsupported transaction type');
            }
            if (accountsToPersist.length > 0) {
                await accountRepository.save(accountsToPersist);
            }
            return {
                balanceEvents,
                finalEvent: {
                    metadata: (0, shared_1.buildEventMetadata)(contracts_1.KafkaTopics.TransactionCompleted, event.metadata.correlationId),
                    payload: {
                        transactionId: payload.transactionId,
                        type: payload.type,
                        status: contracts_1.TransactionStatus.COMPLETED,
                        amount: payload.amount,
                        sourceAccountId: payload.sourceAccountId,
                        targetAccountId: payload.targetAccountId,
                        completedAt: new Date().toISOString(),
                    },
                },
            };
        });
    }
    async findRequiredAccount(repository, accountId) {
        if (!accountId) {
            throw new business_rule_error_1.BusinessRuleError(contracts_1.TransactionRejectionCode.INVALID_REQUEST, 'Required account identifier is missing');
        }
        const account = await repository.findOne({
            where: { id: accountId },
        });
        if (!account) {
            throw new business_rule_error_1.BusinessRuleError(contracts_1.TransactionRejectionCode.ACCOUNT_NOT_FOUND, `Account ${accountId} was not found`);
        }
        return account;
    }
    ensureFunds(account, amount) {
        if (account.balance < amount) {
            throw new business_rule_error_1.BusinessRuleError(contracts_1.TransactionRejectionCode.INSUFFICIENT_FUNDS, `Account ${account.id} does not have enough funds`);
        }
    }
    createBalanceEvent(account, transactionId, correlationId) {
        return {
            metadata: (0, shared_1.buildEventMetadata)(contracts_1.KafkaTopics.BalanceUpdated, correlationId),
            payload: {
                accountId: account.id,
                clientId: account.clientId,
                balance: account.balance,
                transactionId,
            },
        };
    }
};
exports.TransactionOrchestratorService = TransactionOrchestratorService;
exports.TransactionOrchestratorService = TransactionOrchestratorService = TransactionOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(account_entity_1.AccountEntity)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        shared_1.ProcessedEventsService,
        accounts_events_publisher_1.AccountsEventsPublisher])
], TransactionOrchestratorService);
