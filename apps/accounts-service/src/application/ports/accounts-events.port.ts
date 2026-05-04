import { type DomainEvent, type KafkaTopic } from '@app/contracts';

export const ACCOUNTS_EVENTS_PORT = 'ACCOUNTS_EVENTS_PORT';

export interface AccountsEventsPort {
  publish<TPayload>(topic: KafkaTopic, event: DomainEvent<TPayload>): Promise<void>;
}
