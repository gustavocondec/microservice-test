import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DomainEvent, KafkaTopic } from '@app/contracts';
import { lastValueFrom } from 'rxjs';
import { type TransactionsEventsPort } from '../../application/ports/transactions-events.port';

export const TRANSACTIONS_KAFKA_CLIENT = 'TRANSACTIONS_KAFKA_CLIENT';

@Injectable()
export class TransactionsEventsPublisher implements OnModuleInit, TransactionsEventsPort {
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
