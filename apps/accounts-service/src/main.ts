import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { buildKafkaOptions, setupSwagger } from '@app/shared';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT', '3001'));
  const logger = new Logger('AccountsBootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  const swaggerPath = setupSwagger(app, {
    title: 'Accounts Service API',
    description: 'API para gestión de clientes, cuentas bancarias y consulta de saldos.',
  });
  app.connectMicroservice(
    buildKafkaOptions(configService, 'accounts-service', 'accounts-service-group'),
  );

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`accounts-service listening on port ${String(port)}`);
  logger.log(`Swagger available at /${swaggerPath}`);
}

void bootstrap();
