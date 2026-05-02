import { TransactionStatus, TransactionType } from '@app/contracts';
import { InvalidTransactionError } from '../../domain/errors/invalid-transaction.error';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const transactionRepository = {
    findOne: jest.fn(),
    create: jest.fn((value) => ({
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      ...value,
    })),
    save: jest.fn(async (value) => value),
  };
  const processedEventsService = {
    hasProcessed: jest.fn(),
    markProcessed: jest.fn(),
  };
  const eventsPublisher = {
    publish: jest.fn(),
  };

  let service: TransactionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionsService(
      transactionRepository as never,
      processedEventsService as never,
      eventsPublisher as never,
    );
  });

  it('returns the existing transaction when idempotencyKey already exists', async () => {
    const existingTransaction = {
      id: 'tx-1',
      status: TransactionStatus.PENDING,
      idempotencyKey: 'idem-1',
    };

    transactionRepository.findOne.mockResolvedValue(existingTransaction);

    const result = await service.createTransaction({
      type: TransactionType.DEPOSIT,
      amount: 30,
      targetAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
      idempotencyKey: 'idem-1',
    });

    expect(result).toBe(existingTransaction);
    expect(eventsPublisher.publish).not.toHaveBeenCalled();
  });

  it('rejects invalid transfers that reuse the same account', async () => {
    await expect(
      service.createTransaction({
        type: TransactionType.TRANSFER,
        amount: 10,
        sourceAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        targetAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        idempotencyKey: 'idem-2',
      }),
    ).rejects.toBeInstanceOf(InvalidTransactionError);
  });
});
