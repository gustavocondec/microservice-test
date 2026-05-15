import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { buildKafkaOptions, setupSwagger } from '@app/shared';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT', '3002'));
  const logger = new Logger('TransactionsBootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  const swaggerPath = setupSwagger(app, {
    title: 'Transactions Service API',
    description: 'API para registrar transacciones y consultar su estado asíncrono.',
  });
  app.connectMicroservice(
    buildKafkaOptions(configService, 'transactions-service', 'transactions-service-group'),
  );

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`transactions-service listening on port ${String(port)}`);
  logger.log(`Swagger available at /${swaggerPath}`);
}

void bootstrap();
