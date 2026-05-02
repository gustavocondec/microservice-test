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
exports.AiInsightsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const shared_1 = require("../../../../../libs/shared/src");
const llm_port_1 = require("../ports/llm.port");
const ai_insight_entity_1 = require("../../infrastructure/persistence/entities/ai-insight.entity");
let AiInsightsService = class AiInsightsService {
    constructor(aiInsightRepository, processedEventsService, llmPort) {
        this.aiInsightRepository = aiInsightRepository;
        this.processedEventsService = processedEventsService;
        this.llmPort = llmPort;
    }
    async handleTransactionCompleted(event) {
        if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
            return;
        }
        const explanation = await this.llmPort.explainTransaction(this.toExplainInput(event.payload));
        await this.aiInsightRepository.upsert({
            id: (0, crypto_1.randomUUID)(),
            transactionId: event.payload.transactionId,
            type: event.payload.type,
            status: event.payload.status,
            amount: event.payload.amount,
            sourceAccountId: event.payload.sourceAccountId ?? null,
            targetAccountId: event.payload.targetAccountId ?? null,
            reasonCode: null,
            explanation,
        }, ['transactionId']);
        await this.processedEventsService.markProcessed(event.metadata.eventId, event.metadata.eventType);
    }
    async handleTransactionRejected(event) {
        if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
            return;
        }
        const explanation = await this.llmPort.explainTransaction(this.toExplainInput(event.payload));
        await this.aiInsightRepository.upsert({
            id: (0, crypto_1.randomUUID)(),
            transactionId: event.payload.transactionId,
            type: event.payload.type,
            status: event.payload.status,
            amount: event.payload.amount,
            sourceAccountId: event.payload.sourceAccountId ?? null,
            targetAccountId: event.payload.targetAccountId ?? null,
            reasonCode: event.payload.reasonCode,
            explanation,
        }, ['transactionId']);
        await this.processedEventsService.markProcessed(event.metadata.eventId, event.metadata.eventType);
    }
    async getTransactionExplanation(transactionId) {
        const explanation = await this.aiInsightRepository.findOne({
            where: { transactionId },
        });
        if (!explanation) {
            throw new common_1.NotFoundException('No explanation found for the provided transaction');
        }
        return explanation;
    }
    async summarizeAccount(accountId) {
        const insights = await this.aiInsightRepository
            .createQueryBuilder('insight')
            .where('insight.sourceAccountId = :accountId', { accountId })
            .orWhere('insight.targetAccountId = :accountId', { accountId })
            .orderBy('insight.createdAt', 'ASC')
            .getMany();
        const summary = await this.llmPort.summarizeAccountHistory(accountId, insights.map((insight) => ({
            transactionId: insight.transactionId,
            type: insight.type,
            status: insight.status,
            amount: insight.amount,
            sourceAccountId: insight.sourceAccountId,
            targetAccountId: insight.targetAccountId,
            explanation: insight.explanation,
            createdAt: insight.createdAt,
        })));
        return {
            accountId,
            summary,
        };
    }
    toExplainInput(payload) {
        return {
            transactionId: payload.transactionId,
            type: payload.type,
            status: payload.status,
            amount: payload.amount,
            sourceAccountId: payload.sourceAccountId,
            targetAccountId: payload.targetAccountId,
            reasonCode: 'reasonCode' in payload ? payload.reasonCode : undefined,
            reasonMessage: 'reasonMessage' in payload ? payload.reasonMessage : undefined,
        };
    }
};
exports.AiInsightsService = AiInsightsService;
exports.AiInsightsService = AiInsightsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_insight_entity_1.AiInsightEntity)),
    __param(2, (0, common_1.Inject)(llm_port_1.LLM_PORT)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        shared_1.ProcessedEventsService, Object])
], AiInsightsService);
