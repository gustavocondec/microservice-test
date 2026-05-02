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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const contracts_1 = require("../../../../../libs/contracts/src");
const shared_1 = require("../../../../../libs/shared/src");
const invalid_transaction_error_1 = require("../../domain/errors/invalid-transaction.error");
const transactions_events_publisher_1 = require("../../infrastructure/messaging/transactions-events.publisher");
const transaction_entity_1 = require("../../infrastructure/persistence/entities/transaction.entity");
let TransactionsService = class TransactionsService {
    constructor(transactionRepository, processedEventsService, transactionsEventsPublisher) {
        this.transactionRepository = transactionRepository;
        this.processedEventsService = processedEventsService;
        this.transactionsEventsPublisher = transactionsEventsPublisher;
    }
    async createTransaction(dto) {
        this.validateTransactionRequest(dto);
        const existingTransaction = await this.transactionRepository.findOne({
            where: { idempotencyKey: dto.idempotencyKey },
        });
        if (existingTransaction) {
            return existingTransaction;
        }
        const transaction = this.transactionRepository.create({
            id: (0, crypto_1.randomUUID)(),
            type: dto.type,
            status: contracts_1.TransactionStatus.PENDING,
            amount: Number(dto.amount),
            sourceAccountId: dto.sourceAccountId ?? null,
            targetAccountId: dto.targetAccountId ?? null,
            idempotencyKey: dto.idempotencyKey,
        });
        await this.transactionRepository.save(transaction);
        const event = {
            metadata: (0, shared_1.buildEventMetadata)(contracts_1.KafkaTopics.TransactionRequested, dto.correlationId ?? transaction.id),
            payload: {
                transactionId: transaction.id,
                type: transaction.type,
                amount: transaction.amount,
                sourceAccountId: transaction.sourceAccountId ?? undefined,
                targetAccountId: transaction.targetAccountId ?? undefined,
                idempotencyKey: transaction.idempotencyKey,
                requestedAt: transaction.createdAt.toISOString(),
            },
        };
        await this.transactionsEventsPublisher.publish(contracts_1.KafkaTopics.TransactionRequested, event);
        return transaction;
    }
    async getTransaction(transactionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async handleTransactionCompleted(event) {
        if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
            return;
        }
        const transaction = await this.getTransaction(event.payload.transactionId);
        transaction.status = contracts_1.TransactionStatus.COMPLETED;
        transaction.rejectionCode = null;
        transaction.rejectionMessage = null;
        await this.transactionRepository.save(transaction);
        await this.processedEventsService.markProcessed(event.metadata.eventId, event.metadata.eventType);
    }
    async handleTransactionRejected(event) {
        if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
            return;
        }
        const transaction = await this.getTransaction(event.payload.transactionId);
        transaction.status = contracts_1.TransactionStatus.REJECTED;
        transaction.rejectionCode = event.payload.reasonCode;
        transaction.rejectionMessage = event.payload.reasonMessage;
        await this.transactionRepository.save(transaction);
        await this.processedEventsService.markProcessed(event.metadata.eventId, event.metadata.eventType);
    }
    validateTransactionRequest(dto) {
        switch (dto.type) {
            case contracts_1.TransactionType.DEPOSIT:
                if (!dto.targetAccountId) {
                    throw new invalid_transaction_error_1.InvalidTransactionError('Deposits require a target account');
                }
                break;
            case contracts_1.TransactionType.WITHDRAW:
                if (!dto.sourceAccountId) {
                    throw new invalid_transaction_error_1.InvalidTransactionError('Withdrawals require a source account');
                }
                break;
            case contracts_1.TransactionType.TRANSFER:
                if (!dto.sourceAccountId || !dto.targetAccountId) {
                    throw new invalid_transaction_error_1.InvalidTransactionError('Transfers require source and target accounts');
                }
                if (dto.sourceAccountId === dto.targetAccountId) {
                    throw new invalid_transaction_error_1.InvalidTransactionError('Transfers require different accounts');
                }
                break;
            default:
                throw new invalid_transaction_error_1.InvalidTransactionError('Unsupported transaction type');
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.TransactionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        shared_1.ProcessedEventsService,
        transactions_events_publisher_1.TransactionsEventsPublisher])
], TransactionsService);
