import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { buildKafkaOptions, setupSwagger } from '@app/shared';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT', '3003'));
  const logger = new Logger('AiBootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  const swaggerPath = setupSwagger(app, {
    title: 'AI Service API',
    description: 'API para explicaciones y resúmenes de eventos bancarios en lenguaje natural.',
  });
  app.connectMicroservice(buildKafkaOptions(configService, 'ai-service', 'ai-service-group'));

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`ai-service listening on port ${port}`);
  logger.log(`Swagger available at /${swaggerPath}`);
}

bootstrap();
