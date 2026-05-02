"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEventMetadata = exports.buildKafkaOptions = exports.buildTypeOrmOptions = exports.getRequired = void 0;
const microservices_1 = require("@nestjs/microservices");
const crypto_1 = require("crypto");
const getRequired = (configService, key) => {
    const value = configService.get(key);
    if (!value) {
        throw new Error(`Missing required config value: ${key}`);
    }
    return value;
};
exports.getRequired = getRequired;
const buildTypeOrmOptions = (configService, entities, migrations) => ({
    type: 'postgres',
    host: (0, exports.getRequired)(configService, 'DB_HOST'),
    port: Number(configService.get('DB_PORT', '5432')),
    username: (0, exports.getRequired)(configService, 'DB_USER'),
    password: (0, exports.getRequired)(configService, 'DB_PASSWORD'),
    database: (0, exports.getRequired)(configService, 'DB_NAME'),
    entities,
    migrations,
    synchronize: false,
    logging: false,
    autoLoadEntities: false,
});
exports.buildTypeOrmOptions = buildTypeOrmOptions;
const buildKafkaOptions = (configService, defaultClientId, defaultGroupId) => ({
    transport: microservices_1.Transport.KAFKA,
    options: {
        client: {
            clientId: configService.get('KAFKA_CLIENT_ID', defaultClientId),
            brokers: configService.get('KAFKA_BROKERS', 'localhost:9092').split(','),
        },
        consumer: {
            groupId: configService.get('KAFKA_GROUP_ID', defaultGroupId),
            allowAutoTopicCreation: true,
        },
        producerOnlyMode: false,
    },
});
exports.buildKafkaOptions = buildKafkaOptions;
const buildEventMetadata = (eventType, correlationId) => ({
    eventId: (0, crypto_1.randomUUID)(),
    eventType,
    occurredAt: new Date().toISOString(),
    correlationId: correlationId ?? (0, crypto_1.randomUUID)(),
});
exports.buildEventMetadata = buildEventMetadata;
