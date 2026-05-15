import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  buildTypeOrmOptions,
  DatabaseBootstrapService,
  ProcessedEventEntity,
  ProcessedEventsService,
} from '@app/shared';
import { AI_INSIGHTS_REPOSITORY } from './application/ports/ai-insights.repository';
import { LLM_PORT } from './application/ports/llm.port';
import { PROCESSED_EVENTS_PORT } from './application/ports/processed-events.port';
import { GetTransactionExplanationUseCase } from './application/use-cases/get-transaction-explanation.use-case';
import { HandleTransactionCompletedUseCase } from './application/use-cases/handle-transaction-completed.use-case';
import { HandleTransactionRejectedUseCase } from './application/use-cases/handle-transaction-rejected.use-case';
import { SummarizeAccountUseCase } from './application/use-cases/summarize-account.use-case';
import { AiController } from './infrastructure/http/ai.controller';
import { HealthController } from './infrastructure/http/health.controller';
import { MockLlmProvider } from './infrastructure/llm/mock-llm.provider';
import { AiConsumerController } from './infrastructure/messaging/ai.consumer';
import { AiInsightEntity } from './infrastructure/persistence/entities/ai-insight.entity';
import { InitAi1712702000000 } from './infrastructure/persistence/migrations/1712702000000-init-ai';
import { TypeOrmAiInsightsRepository } from './infrastructure/persistence/typeorm-ai-insights.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildTypeOrmOptions(
          configService,
          [AiInsightEntity, ProcessedEventEntity],
          [InitAi1712702000000],
        ),
    }),
    TypeOrmModule.forFeature([AiInsightEntity, ProcessedEventEntity]),
  ],
  controllers: [AiController, HealthController, AiConsumerController],
  providers: [
    {
      provide: GetTransactionExplanationUseCase,
      useFactory: (aiInsightRepository) =>
        new GetTransactionExplanationUseCase(aiInsightRepository),
      inject: [AI_INSIGHTS_REPOSITORY],
    },
    {
      provide: SummarizeAccountUseCase,
      useFactory: (aiInsightRepository, llmPort) =>
        new SummarizeAccountUseCase(aiInsightRepository, llmPort),
      inject: [AI_INSIGHTS_REPOSITORY, LLM_PORT],
    },
    {
      provide: HandleTransactionCompletedUseCase,
      useFactory: (aiInsightRepository, processedEventsService, llmPort) =>
        new HandleTransactionCompletedUseCase(aiInsightRepository, processedEventsService, llmPort),
      inject: [AI_INSIGHTS_REPOSITORY, PROCESSED_EVENTS_PORT, LLM_PORT],
    },
    {
      provide: HandleTransactionRejectedUseCase,
      useFactory: (aiInsightRepository, processedEventsService, llmPort) =>
        new HandleTransactionRejectedUseCase(aiInsightRepository, processedEventsService, llmPort),
      inject: [AI_INSIGHTS_REPOSITORY, PROCESSED_EVENTS_PORT, LLM_PORT],
    },
    TypeOrmAiInsightsRepository,
    MockLlmProvider,
    DatabaseBootstrapService,
    ProcessedEventsService,
    {
      provide: AI_INSIGHTS_REPOSITORY,
      useExisting: TypeOrmAiInsightsRepository,
    },
    {
      provide: PROCESSED_EVENTS_PORT,
      useExisting: ProcessedEventsService,
    },
    {
      provide: LLM_PORT,
      useExisting: MockLlmProvider,
    },
  ],
})
export class AppModule {}
