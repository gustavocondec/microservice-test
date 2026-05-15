import { TransactionStatus, TransactionType } from '@app/contracts';
import { Transaction } from '../../domain/entities/transaction';
import { InvalidTransactionError } from '../../domain/errors/invalid-transaction.error';
import { CreateTransactionUseCase } from './create-transaction.use-case';

describe('CreateTransactionUseCase', () => {
  const transactionRepository = {
    findById: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    save: jest.fn(async (value) => value),
  };
  const eventsPublisher = {
    publish: jest.fn(),
  };

  let useCase: CreateTransactionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
    useCase = new CreateTransactionUseCase(
      transactionRepository as never,
      eventsPublisher as never,
    );
  });

  it('returns the existing transaction when idempotencyKey already exists', async () => {
    const existingTransaction = Transaction.restore({
      id: 'tx-1',
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      amount: 30,
      idempotencyKey: 'idem-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    transactionRepository.findByIdempotencyKey.mockResolvedValue(existingTransaction);

    const result = await useCase.execute({
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
      useCase.execute({
        type: TransactionType.TRANSFER,
        amount: 10,
        sourceAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        targetAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        idempotencyKey: 'idem-2',
      }),
    ).rejects.toBeInstanceOf(InvalidTransactionError);
  });
});
