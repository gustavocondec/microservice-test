import {
  type DomainEvent,
  KafkaTopics,
  TransactionType,
  type TransactionRequestedPayload,
} from '@app/contracts';
import { Account } from '../../domain/entities/account';
import { HandleTransactionRequestedUseCase } from './handle-transaction-requested.use-case';

describe('HandleTransactionRequestedUseCase', () => {
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

  const buildEvent = (
    payload: Partial<TransactionRequestedPayload>,
  ): DomainEvent<TransactionRequestedPayload> => ({
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
      findById: jest.fn().mockResolvedValue(
        Account.restore({
          id: 'acc-1',
          clientId: 'client-1',
          currency: 'USD',
          balance: 10,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ),
      saveAll: jest.fn(),
    };
    const accountsUnitOfWork = {
      run: jest.fn(async (callback: (repository: typeof accountRepository) => unknown) =>
        callback(accountRepository),
      ),
    };

    processedEventsService.hasProcessed.mockResolvedValue(false);

    const useCase = new HandleTransactionRequestedUseCase(
      accountsUnitOfWork as never,
      processedEventsService,
      accountsEventsPublisher as never,
    );

    await useCase.execute(
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
    const sourceAccount = Account.restore({
      id: 'acc-1',
      clientId: 'client-1',
      currency: 'USD',
      balance: 100,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const targetAccount = Account.restore({
      id: 'acc-2',
      clientId: 'client-2',
      currency: 'USD',
      balance: 10,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const accountRepository = {
      findById: jest.fn().mockResolvedValueOnce(sourceAccount).mockResolvedValueOnce(targetAccount),
      saveAll: jest.fn(async (entities) => entities),
    };
    const accountsUnitOfWork = {
      run: jest.fn(async (callback: (repository: typeof accountRepository) => unknown) =>
        callback(accountRepository),
      ),
    };

    processedEventsService.hasProcessed.mockResolvedValue(false);

    const useCase = new HandleTransactionRequestedUseCase(
      accountsUnitOfWork as never,
      processedEventsService,
      accountsEventsPublisher as never,
    );

    await useCase.execute(
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
