import {
  type DomainEvent,
  KafkaTopics,
  TransactionType,
  type TransactionRequestedPayload,
} from '@app/contracts';
import { TransactionOrchestratorService } from './transaction-orchestrator.service';

describe('TransactionOrchestratorService', () => {
  const processedEventsService = {
    hasProcessed: jest.fn(),
    markProcessed: jest.fn(),
  };
  const accountsEventsPublisher = {
    publish: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const buildEvent = (payload: Partial<TransactionRequestedPayload>): DomainEvent<TransactionRequestedPayload> => ({
    metadata: {
      eventId: 'event-1',
      eventType: KafkaTopics.TransactionRequested,
      occurredAt: new Date().toISOString(),
      correlationId: 'corr-1',
    },
    payload: {
      transactionId: 'tx-1',
      type: TransactionType.WITHDRAW,
      amount: 50,
      idempotencyKey: 'idem-1',
      requestedAt: new Date().toISOString(),
      ...payload,
    },
  });

  it('rejects withdrawals with insufficient funds', async () => {
    const accountRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'acc-1',
        clientId: 'client-1',
        balance: 10,
      }),
      saveAll: jest.fn(),
    };
    const accountsUnitOfWork = {
      run: jest.fn(async (callback: (repository: typeof accountRepository) => unknown) =>
        callback(accountRepository),
      ),
    };

    processedEventsService.hasProcessed.mockResolvedValue(false);

    const service = new TransactionOrchestratorService(
      accountsUnitOfWork as never,
      processedEventsService as never,
      accountsEventsPublisher as never,
    );

    await service.handleTransactionRequested(
      buildEvent({
        type: TransactionType.WITHDRAW,
        sourceAccountId: 'acc-1',
        amount: 20,
      }),
    );

    expect(accountsEventsPublisher.publish).toHaveBeenCalledTimes(1);
    expect(accountsEventsPublisher.publish).toHaveBeenCalledWith(
      KafkaTopics.TransactionRejected,
      expect.objectContaining({
        payload: expect.objectContaining({
          transactionId: 'tx-1',
        }),
      }),
    );
    expect(processedEventsService.markProcessed).toHaveBeenCalledWith(
      'event-1',
      KafkaTopics.TransactionRequested,
    );
  });

  it('processes valid transfers and publishes resulting events', async () => {
    const sourceAccount = {
      id: 'acc-1',
      clientId: 'client-1',
      balance: 100,
    };
    const targetAccount = {
      id: 'acc-2',
      clientId: 'client-2',
      balance: 10,
    };
    const accountRepository = {
      findById: jest
        .fn()
        .mockResolvedValueOnce(sourceAccount)
        .mockResolvedValueOnce(targetAccount),
      saveAll: jest.fn(async (entities) => entities),
    };
    const accountsUnitOfWork = {
      run: jest.fn(async (callback: (repository: typeof accountRepository) => unknown) =>
        callback(accountRepository),
      ),
    };

    processedEventsService.hasProcessed.mockResolvedValue(false);

    const service = new TransactionOrchestratorService(
      accountsUnitOfWork as never,
      processedEventsService as never,
      accountsEventsPublisher as never,
    );

    await service.handleTransactionRequested(
      buildEvent({
        type: TransactionType.TRANSFER,
        sourceAccountId: 'acc-1',
        targetAccountId: 'acc-2',
        amount: 25,
      }),
    );

    expect(sourceAccount.balance).toBe(75);
    expect(targetAccount.balance).toBe(35);
    expect(accountsEventsPublisher.publish).toHaveBeenCalledTimes(3);
    expect(accountsEventsPublisher.publish).toHaveBeenNthCalledWith(
      3,
      KafkaTopics.TransactionCompleted,
      expect.objectContaining({
        payload: expect.objectContaining({
          status: 'COMPLETED',
        }),
      }),
    );
  });
});
