export const PROCESSED_EVENTS_PORT = 'PROCESSED_EVENTS_PORT';

export interface ProcessedEventsPort {
  hasProcessed(eventId: string): Promise<boolean>;
  markProcessed(eventId: string, eventType: string): Promise<void>;
}
