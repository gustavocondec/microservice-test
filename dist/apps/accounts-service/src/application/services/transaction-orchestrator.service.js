"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionOrchestratorService = void 0;
const crypto_1 = require("crypto");
const contracts_1 = require("../../../../../libs/contracts/src");
const business_rule_error_1 = require("../../domain/errors/business-rule.error");
class TransactionOrchestratorService {
    constructor(accountsUnitOfWork, processedEventsService, accountsEventsPublisher) {
        this.accountsUnitOfWork = accountsUnitOfWork;
        this.processedEventsService = processedEventsService;
        this.accountsEventsPublisher = accountsEventsPublisher;
    }
    async handleTransactionRequested(event) {
        if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
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
                    metadata: this.createEventMetadata(contracts_1.KafkaTopics.TransactionRejected, event.metadata.correlationId),
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
        return this.accountsUnitOfWork.run(async (accountRepository) => {
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
                await accountRepository.saveAll(accountsToPersist);
            }
            return {
                balanceEvents,
                finalEvent: {
                    metadata: this.createEventMetadata(contracts_1.KafkaTopics.TransactionCompleted, event.metadata.correlationId),
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
        const account = await repository.findById(accountId);
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
            metadata: this.createEventMetadata(contracts_1.KafkaTopics.BalanceUpdated, correlationId),
            payload: {
                accountId: account.id,
                clientId: account.clientId,
                balance: account.balance,
                transactionId,
            },
        };
    }
    createEventMetadata(eventType, correlationId) {
        return {
            eventId: (0, crypto_1.randomUUID)(),
            eventType,
            occurredAt: new Date().toISOString(),
            correlationId,
        };
    }
}
exports.TransactionOrchestratorService = TransactionOrchestratorService;
