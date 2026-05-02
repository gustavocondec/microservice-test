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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const contracts_1 = require("../../../../../libs/contracts/src");
const shared_1 = require("../../../../../libs/shared/src");
const account_entity_1 = require("../../infrastructure/persistence/entities/account.entity");
const client_entity_1 = require("../../infrastructure/persistence/entities/client.entity");
const accounts_events_publisher_1 = require("../../infrastructure/messaging/accounts-events.publisher");
let AccountsService = class AccountsService {
    constructor(accountRepository, clientRepository, accountsEventsPublisher) {
        this.accountRepository = accountRepository;
        this.clientRepository = clientRepository;
        this.accountsEventsPublisher = accountsEventsPublisher;
    }
    async createAccount(dto) {
        const client = await this.clientRepository.findOne({
            where: { id: dto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        if (dto.initialBalance < 0) {
            throw new common_1.BadRequestException('Initial balance cannot be negative');
        }
        const account = this.accountRepository.create({
            id: (0, crypto_1.randomUUID)(),
            clientId: dto.clientId,
            currency: dto.currency.toUpperCase(),
            balance: Number(dto.initialBalance ?? 0),
        });
        await this.accountRepository.save(account);
        const event = {
            metadata: (0, shared_1.buildEventMetadata)(contracts_1.KafkaTopics.AccountCreated, account.id),
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
        const account = await this.accountRepository.findOne({ where: { id: accountId } });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async listAccountsByClient(clientId) {
        await this.ensureClientExists(clientId);
        return this.accountRepository.find({
            where: { clientId },
            order: { createdAt: 'ASC' },
        });
    }
    async ensureClientExists(clientId) {
        const client = await this.clientRepository.findOne({ where: { id: clientId } });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.AccountEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(client_entity_1.ClientEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        accounts_events_publisher_1.AccountsEventsPublisher])
], AccountsService);
