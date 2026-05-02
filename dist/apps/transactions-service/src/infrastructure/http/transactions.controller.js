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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contracts_1 = require("../../../../../libs/contracts/src");
const transactions_service_1 = require("../../application/services/transactions.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    createTransaction(dto) {
        return this.transactionsService.createTransaction(dto);
    }
    getTransaction(transactionId) {
        return this.transactionsService.getTransaction(transactionId);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Registrar una nueva transacción' }),
    (0, swagger_1.ApiBody)({
        type: create_transaction_dto_1.CreateTransactionDto,
        examples: {
            deposit: {
                summary: 'Depósito',
                value: {
                    type: contracts_1.TransactionType.DEPOSIT,
                    amount: 100,
                    targetAccountId: 'e9055df1-325c-4ce1-b8fb-c835f0927e8a',
                    idempotencyKey: 'deposit-001',
                    correlationId: 'corr-deposit-001',
                },
            },
            withdraw: {
                summary: 'Retiro',
                value: {
                    type: contracts_1.TransactionType.WITHDRAW,
                    amount: 25,
                    sourceAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
                    idempotencyKey: 'withdraw-001',
                    correlationId: 'corr-withdraw-001',
                },
            },
            transfer: {
                summary: 'Transferencia',
                value: {
                    type: contracts_1.TransactionType.TRANSFER,
                    amount: 40,
                    sourceAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
                    targetAccountId: 'e9055df1-325c-4ce1-b8fb-c835f0927e8a',
                    idempotencyKey: 'transfer-001',
                    correlationId: 'corr-transfer-001',
                },
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "createTransaction", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Consultar el estado de una transacción' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'UUID de la transacción' }),
    (0, common_1.Get)(':transactionId'),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getTransaction", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
