"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const crypto_1 = require("crypto");
const contracts_1 = require("../../../../../libs/contracts/src");
const invalid_transaction_error_1 = require("../../domain/errors/invalid-transaction.error");
const transaction_not_found_error_1 = require("../../domain/errors/transaction-not-found.error");
class TransactionsService {
    constructor(transactionRepository, processedEventsService, transactionsEventsPublisher) {
        this.transactionRepository = transactionRepository;
        this.processedEventsService = processedEventsService;
        this.transactionsEventsPublisher = transactionsEventsPublisher;
    }
    async createTransaction(input) {
        this.validateTransactionRequest(input);
        const existingTransaction = await this.transactionRepository.findByIdempotencyKey(input.idempotencyKey);
        if (existingTransaction) {
            return existingTransaction;
        }
        const transaction = await this.transactionRepository.create({
            id: (0, crypto_1.randomUUID)(),
            type: input.type,
            status: contracts_1.TransactionStatus.PENDING,
            amount: Number(input.amount),
            sourceAccountId: input.sourceAccountId ?? null,
            targetAccountId: input.targetAccountId ?? null,
            idempotencyKey: input.idempotencyKey,
        });
        const event = {
            metadata: {
                eventId: (0, crypto_1.randomUUID)(),
                eventType: contracts_1.KafkaTopics.TransactionRequested,
                occurredAt: new Date().toISOString(),
                correlationId: input.correlationId ?? transaction.id,
            },
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
        const transaction = await this.transactionRepository.findById(transactionId);
        if (!transaction) {
            throw new transaction_not_found_error_1.TransactionNotFoundError();
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
    validateTransactionRequest(input) {
        switch (input.type) {
            case contracts_1.TransactionType.DEPOSIT:
                if (!input.targetAccountId) {
                    throw new invalid_transaction_error_1.InvalidTransactionError('Deposits require a target account');
                }
                break;
            case contracts_1.TransactionType.WITHDRAW:
                if (!input.sourceAccountId) {
                    throw new invalid_transaction_error_1.InvalidTransactionError('Withdrawals require a source account');
                }
                break;
            case contracts_1.TransactionType.TRANSFER:
                if (!input.sourceAccountId || !input.targetAccountId) {
                    throw new invalid_transaction_error_1.InvalidTransactionError('Transfers require source and target accounts');
                }
                if (input.sourceAccountId === input.targetAccountId) {
                    throw new invalid_transaction_error_1.InvalidTransactionError('Transfers require different accounts');
                }
                break;
            default:
                throw new invalid_transaction_error_1.InvalidTransactionError('Unsupported transaction type');
        }
    }
}
exports.TransactionsService = TransactionsService;
