import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DomainEvent, KafkaTopic } from '@app/contracts';
import { lastValueFrom } from 'rxjs';

export const TRANSACTIONS_KAFKA_CLIENT = 'TRANSACTIONS_KAFKA_CLIENT';

@Injectable()
export class TransactionsEventsPublisher implements OnModuleInit {
  constructor(
    @Inject(TRANSACTIONS_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
  }

  async publish<TPayload>(topic: KafkaTopic, event: DomainEvent<TPayload>): Promise<void> {
    await lastValueFrom(this.kafkaClient.emit(topic, event));
  }
}
