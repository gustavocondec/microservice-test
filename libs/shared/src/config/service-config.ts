import { type Type } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { type EventMetadata } from '@app/contracts';
import { type KafkaOptions, Transport } from '@nestjs/microservices';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';

export const getRequired = (configService: ConfigService, key: string): string => {
  const value = configService.get<string>(key);

  if (!value) {
    throw new Error(`Missing required config value: ${key}`);
  }

  return value;
};

export const buildTypeOrmOptions = (
  configService: ConfigService,
  entities: Type<unknown>[],
  migrations: Type<unknown>[],
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: getRequired(configService, 'DB_HOST'),
  port: Number(configService.get<string>('DB_PORT', '5432')),
  username: getRequired(configService, 'DB_USER'),
  password: getRequired(configService, 'DB_PASSWORD'),
  database: getRequired(configService, 'DB_NAME'),
  entities,
  migrations,
  synchronize: false,
  logging: false,
  autoLoadEntities: false,
});

export const buildKafkaOptions = (
  configService: ConfigService,
  defaultClientId: string,
  defaultGroupId: string,
): KafkaOptions => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: configService.get<string>('KAFKA_CLIENT_ID', defaultClientId),
      brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
    },
    consumer: {
      groupId: configService.get<string>('KAFKA_GROUP_ID', defaultGroupId),
      allowAutoTopicCreation: true,
    },
    producerOnlyMode: false,
  },
});

export const buildEventMetadata = (eventType: string, correlationId?: string): EventMetadata => ({
  eventId: randomUUID(),
  eventType,
  occurredAt: new Date().toISOString(),
  correlationId: correlationId ?? randomUUID(),
});
