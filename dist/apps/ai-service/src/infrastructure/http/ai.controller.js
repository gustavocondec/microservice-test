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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const get_transaction_explanation_use_case_1 = require("../../application/use-cases/get-transaction-explanation.use-case");
const summarize_account_use_case_1 = require("../../application/use-cases/summarize-account.use-case");
const ai_exception_filter_1 = require("./ai-exception.filter");
let AiController = class AiController {
    constructor(getTransactionExplanationUseCase, summarizeAccountUseCase) {
        this.getTransactionExplanationUseCase = getTransactionExplanationUseCase;
        this.summarizeAccountUseCase = summarizeAccountUseCase;
    }
    getTransactionExplanation(transactionId) {
        return this.getTransactionExplanationUseCase.execute(transactionId);
    }
    summarizeAccount(accountId) {
        return this.summarizeAccountUseCase.execute(accountId);
    }
};
exports.AiController = AiController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener explicación de una transacción' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'UUID de la transacción' }),
    (0, common_1.Get)('explanations/transactions/:transactionId'),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getTransactionExplanation", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener resumen de transacciones de una cuenta' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'UUID de la cuenta' }),
    (0, common_1.Get)('summaries/accounts/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "summarizeAccount", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.UseFilters)(ai_exception_filter_1.AiExceptionFilter),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [get_transaction_explanation_use_case_1.GetTransactionExplanationUseCase,
        summarize_account_use_case_1.SummarizeAccountUseCase])
], AiController);
