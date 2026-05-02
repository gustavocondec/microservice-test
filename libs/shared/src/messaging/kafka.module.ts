import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({})
export class KafkaClientsModule {
  static register(clientName: string, defaultClientId: string): DynamicModule {
    return {
      module: KafkaClientsModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: clientName,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.KAFKA,
              options: {
                client: {
                  clientId: configService.get<string>('KAFKA_CLIENT_ID', defaultClientId),
                  brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
                },
                producerOnlyMode: true,
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
