import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  buildTypeOrmOptions,
  DatabaseBootstrapService,
  ProcessedEventEntity,
  ProcessedEventsService,
} from '@app/shared';
import { AiInsightsService } from './application/services/ai-insights.service';
import { LLM_PORT } from './application/ports/llm.port';
import { AiController } from './infrastructure/http/ai.controller';
import { HealthController } from './infrastructure/http/health.controller';
import { MockLlmProvider } from './infrastructure/llm/mock-llm.provider';
import { AiConsumerController } from './infrastructure/messaging/ai.consumer';
import { AiInsightEntity } from './infrastructure/persistence/entities/ai-insight.entity';
import { InitAi1712702000000 } from './infrastructure/persistence/migrations/1712702000000-init-ai';

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
    AiInsightsService,
    MockLlmProvider,
    DatabaseBootstrapService,
    ProcessedEventsService,
    {
      provide: LLM_PORT,
      useExisting: MockLlmProvider,
    },
  ],
})
export class AppModule {}
