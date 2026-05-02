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
exports.TransactionsEventsConsumerController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../../../../../libs/contracts/src");
const transactions_service_1 = require("../../application/services/transactions.service");
let TransactionsEventsConsumerController = class TransactionsEventsConsumerController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async handleTransactionCompleted(event) {
        await this.transactionsService.handleTransactionCompleted(event);
    }
    async handleTransactionRejected(event) {
        await this.transactionsService.handleTransactionRejected(event);
    }
};
exports.TransactionsEventsConsumerController = TransactionsEventsConsumerController;
__decorate([
    (0, microservices_1.EventPattern)(contracts_1.KafkaTopics.TransactionCompleted),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsEventsConsumerController.prototype, "handleTransactionCompleted", null);
__decorate([
    (0, microservices_1.EventPattern)(contracts_1.KafkaTopics.TransactionRejected),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsEventsConsumerController.prototype, "handleTransactionRejected", null);
exports.TransactionsEventsConsumerController = TransactionsEventsConsumerController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsEventsConsumerController);
