"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsService = void 0;
const crypto_1 = require("crypto");
const contracts_1 = require("../../../../../libs/contracts/src");
const account_not_found_error_1 = require("../../domain/errors/account-not-found.error");
const client_not_found_error_1 = require("../../domain/errors/client-not-found.error");
const invalid_initial_balance_error_1 = require("../../domain/errors/invalid-initial-balance.error");
class AccountsService {
    constructor(accountRepository, clientRepository, accountsEventsPublisher) {
        this.accountRepository = accountRepository;
        this.clientRepository = clientRepository;
        this.accountsEventsPublisher = accountsEventsPublisher;
    }
    async createAccount(input) {
        const client = await this.clientRepository.findById(input.clientId);
        if (!client) {
            throw new client_not_found_error_1.ClientNotFoundError();
        }
        if (input.initialBalance < 0) {
            throw new invalid_initial_balance_error_1.InvalidInitialBalanceError();
        }
        const account = await this.accountRepository.create({
            id: (0, crypto_1.randomUUID)(),
            clientId: input.clientId,
            currency: input.currency.toUpperCase(),
            balance: Number(input.initialBalance ?? 0),
        });
        const event = {
            metadata: {
                eventId: (0, crypto_1.randomUUID)(),
                eventType: contracts_1.KafkaTopics.AccountCreated,
                occurredAt: new Date().toISOString(),
                correlationId: account.id,
            },
            payload: {
                accountId: account.id,
                clientId: account.clientId,
                currency: account.currency,
                balance: account.balance,
            },
        };
        await this.accountsEventsPublisher.publish(contracts_1.KafkaTopics.AccountCreated, event);
        return account;
    }
    async getAccount(accountId) {
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new account_not_found_error_1.AccountNotFoundError();
        }
        return account;
    }
    async listAccountsByClient(clientId) {
        await this.ensureClientExists(clientId);
        return this.accountRepository.findByClientId(clientId);
    }
    async ensureClientExists(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client) {
            throw new client_not_found_error_1.ClientNotFoundError();
        }
    }
}
exports.AccountsService = AccountsService;
