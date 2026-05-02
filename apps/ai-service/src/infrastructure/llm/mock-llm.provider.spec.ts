import { TransactionStatus, TransactionType } from '@app/contracts';
import { MockLlmProvider } from './mock-llm.provider';

describe('MockLlmProvider', () => {
  let provider: MockLlmProvider;

  beforeEach(() => {
    provider = new MockLlmProvider();
  });

  it('explains rejected transactions', async () => {
    await expect(
      provider.explainTransaction({
        transactionId: 'tx-1',
        type: TransactionType.TRANSFER,
        status: TransactionStatus.REJECTED,
        amount: 100,
        sourceAccountId: 'acc-1',
        targetAccountId: 'acc-2',
        reasonMessage: 'Account acc-1 does not have enough funds',
      }),
    ).resolves.toContain('was rejected');
  });

  it('summarizes account history deterministically', async () => {
    await expect(
      provider.summarizeAccountHistory('acc-1', [
        {
          transactionId: 'tx-1',
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          amount: 50,
          targetAccountId: 'acc-1',
          explanation: 'Deposit completed.',
          createdAt: new Date(),
        },
      ]),
    ).resolves.toContain('1 tracked transactions');
  });
});
