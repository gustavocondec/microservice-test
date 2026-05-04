import { type DomainEvent, type KafkaTopic } from '@app/contracts';

export const TRANSACTIONS_EVENTS_PORT = 'TRANSACTIONS_EVENTS_PORT';

export interface TransactionsEventsPort {
  publish<TPayload>(topic: KafkaTopic, event: DomainEvent<TPayload>): Promise<void>;
}
