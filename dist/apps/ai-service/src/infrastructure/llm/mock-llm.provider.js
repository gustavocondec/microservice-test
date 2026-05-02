"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLlmProvider = void 0;
const common_1 = require("@nestjs/common");
const contracts_1 = require("../../../../../libs/contracts/src");
let MockLlmProvider = class MockLlmProvider {
    async explainTransaction(input) {
        if (input.status === contracts_1.TransactionStatus.REJECTED) {
            return `Transaction ${input.transactionId} was rejected because ${input.reasonMessage?.toLowerCase()}.`;
        }
        switch (input.type) {
            case contracts_1.TransactionType.DEPOSIT:
                return `Deposit ${input.transactionId} completed successfully for ${input.amount.toFixed(2)} into account ${input.targetAccountId}.`;
            case contracts_1.TransactionType.WITHDRAW:
                return `Withdrawal ${input.transactionId} completed successfully for ${input.amount.toFixed(2)} from account ${input.sourceAccountId}.`;
            case contracts_1.TransactionType.TRANSFER:
                return `Transfer ${input.transactionId} completed successfully for ${input.amount.toFixed(2)} from account ${input.sourceAccountId} to account ${input.targetAccountId}.`;
            default:
                return `Transaction ${input.transactionId} completed successfully.`;
        }
    }
    async summarizeAccountHistory(accountId, events) {
        if (events.length === 0) {
            return `Account ${accountId} has no transaction history available.`;
        }
        const completed = events.filter((event) => event.status === contracts_1.TransactionStatus.COMPLETED).length;
        const rejected = events.filter((event) => event.status === contracts_1.TransactionStatus.REJECTED).length;
        const total = events.reduce((sum, event) => sum + event.amount, 0);
        const latest = events[events.length - 1];
        return `Account ${accountId} has ${events.length} tracked transactions: ${completed} completed and ${rejected} rejected. The cumulative moved amount is ${total.toFixed(2)}. Latest insight: ${latest.explanation}`;
    }
};
exports.MockLlmProvider = MockLlmProvider;
exports.MockLlmProvider = MockLlmProvider = __decorate([
    (0, common_1.Injectable)()
], MockLlmProvider);
