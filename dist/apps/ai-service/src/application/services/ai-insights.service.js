"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInsightsService = void 0;
const crypto_1 = require("crypto");
const ai_insight_not_found_error_1 = require("../../domain/errors/ai-insight-not-found.error");
class AiInsightsService {
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
        await this.aiInsightRepository.upsertByTransactionId({
            id: (0, crypto_1.randomUUID)(),
            transactionId: event.payload.transactionId,
            type: event.payload.type,
            status: event.payload.status,
            amount: event.payload.amount,
            sourceAccountId: event.payload.sourceAccountId ?? null,
            targetAccountId: event.payload.targetAccountId ?? null,
            reasonCode: null,
            explanation,
        });
        await this.processedEventsService.markProcessed(event.metadata.eventId, event.metadata.eventType);
    }
    async handleTransactionRejected(event) {
        if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
            return;
        }
        const explanation = await this.llmPort.explainTransaction(this.toExplainInput(event.payload));
        await this.aiInsightRepository.upsertByTransactionId({
            id: (0, crypto_1.randomUUID)(),
            transactionId: event.payload.transactionId,
            type: event.payload.type,
            status: event.payload.status,
            amount: event.payload.amount,
            sourceAccountId: event.payload.sourceAccountId ?? null,
            targetAccountId: event.payload.targetAccountId ?? null,
            reasonCode: event.payload.reasonCode,
            explanation,
        });
        await this.processedEventsService.markProcessed(event.metadata.eventId, event.metadata.eventType);
    }
    async getTransactionExplanation(transactionId) {
        const explanation = await this.aiInsightRepository.findByTransactionId(transactionId);
        if (!explanation) {
            throw new ai_insight_not_found_error_1.AiInsightNotFoundError();
        }
        return explanation;
    }
    async summarizeAccount(accountId) {
        const insights = await this.aiInsightRepository.findByAccountId(accountId);
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
}
exports.AiInsightsService = AiInsightsService;
