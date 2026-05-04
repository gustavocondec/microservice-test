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
exports.TransactionsConsumerController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../../../../../libs/contracts/src");
const handle_transaction_requested_use_case_1 = require("../../application/use-cases/handle-transaction-requested.use-case");
let TransactionsConsumerController = class TransactionsConsumerController {
    constructor(handleTransactionRequestedUseCase) {
        this.handleTransactionRequestedUseCase = handleTransactionRequestedUseCase;
    }
    async handleTransactionRequested(event) {
        await this.handleTransactionRequestedUseCase.execute(event);
    }
};
exports.TransactionsConsumerController = TransactionsConsumerController;
__decorate([
    (0, microservices_1.EventPattern)(contracts_1.KafkaTopics.TransactionRequested),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsConsumerController.prototype, "handleTransactionRequested", null);
exports.TransactionsConsumerController = TransactionsConsumerController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [handle_transaction_requested_use_case_1.HandleTransactionRequestedUseCase])
], TransactionsConsumerController);
