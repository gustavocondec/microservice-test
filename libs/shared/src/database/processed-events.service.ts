import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedEventEntity } from './processed-event.entity';

@Injectable()
export class ProcessedEventsService {
  constructor(
    @InjectRepository(ProcessedEventEntity)
    private readonly processedEventRepository: Repository<ProcessedEventEntity>,
  ) {}

  async hasProcessed(eventId: string): Promise<boolean> {
    const processedEvent = await this.processedEventRepository.findOne({
      where: { eventId },
    });

    return Boolean(processedEvent);
  }

  async markProcessed(eventId: string, eventType: string): Promise<void> {
    await this.processedEventRepository.upsert(
      {
        eventId,
        eventType,
        processedAt: new Date(),
      },
      ['eventId'],
    );
  }
}
