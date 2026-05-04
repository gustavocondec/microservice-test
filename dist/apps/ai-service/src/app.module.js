"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const shared_1 = require("../../../libs/shared/src");
const ai_insights_repository_1 = require("./application/ports/ai-insights.repository");
const ai_insights_service_1 = require("./application/services/ai-insights.service");
const llm_port_1 = require("./application/ports/llm.port");
const processed_events_port_1 = require("./application/ports/processed-events.port");
const ai_controller_1 = require("./infrastructure/http/ai.controller");
const health_controller_1 = require("./infrastructure/http/health.controller");
const mock_llm_provider_1 = require("./infrastructure/llm/mock-llm.provider");
const ai_consumer_1 = require("./infrastructure/messaging/ai.consumer");
const ai_insight_entity_1 = require("./infrastructure/persistence/entities/ai-insight.entity");
const _1712702000000_init_ai_1 = require("./infrastructure/persistence/migrations/1712702000000-init-ai");
const typeorm_ai_insights_repository_1 = require("./infrastructure/persistence/typeorm-ai-insights.repository");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => (0, shared_1.buildTypeOrmOptions)(configService, [ai_insight_entity_1.AiInsightEntity, shared_1.ProcessedEventEntity], [_1712702000000_init_ai_1.InitAi1712702000000]),
            }),
            typeorm_1.TypeOrmModule.forFeature([ai_insight_entity_1.AiInsightEntity, shared_1.ProcessedEventEntity]),
        ],
        controllers: [ai_controller_1.AiController, health_controller_1.HealthController, ai_consumer_1.AiConsumerController],
        providers: [
            {
                provide: ai_insights_service_1.AiInsightsService,
                useFactory: (aiInsightRepository, processedEventsService, llmPort) => new ai_insights_service_1.AiInsightsService(aiInsightRepository, processedEventsService, llmPort),
                inject: [ai_insights_repository_1.AI_INSIGHTS_REPOSITORY, processed_events_port_1.PROCESSED_EVENTS_PORT, llm_port_1.LLM_PORT],
            },
            typeorm_ai_insights_repository_1.TypeOrmAiInsightsRepository,
            mock_llm_provider_1.MockLlmProvider,
            shared_1.DatabaseBootstrapService,
            shared_1.ProcessedEventsService,
            {
                provide: ai_insights_repository_1.AI_INSIGHTS_REPOSITORY,
                useExisting: typeorm_ai_insights_repository_1.TypeOrmAiInsightsRepository,
            },
            {
                provide: processed_events_port_1.PROCESSED_EVENTS_PORT,
                useExisting: shared_1.ProcessedEventsService,
            },
            {
                provide: llm_port_1.LLM_PORT,
                useExisting: mock_llm_provider_1.MockLlmProvider,
            },
        ],
    })
], AppModule);
