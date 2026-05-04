import { ClientNotFoundError } from '../../domain/errors/client-not-found.error';
import { InvalidInitialBalanceError } from '../../domain/errors/invalid-initial-balance.error';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  const accountRepository = {
    create: jest.fn(async (value) => ({
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      ...value,
    })),
    findByClientId: jest.fn(),
    findById: jest.fn(),
  };
  const clientRepository = {
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };
  const eventsPublisher = {
    publish: jest.fn(),
  };

  let service: AccountsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccountsService(
      accountRepository as never,
      clientRepository as never,
      eventsPublisher as never,
    );
  });

  it('rejects account creation when client does not exist', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(
      service.createAccount({
        clientId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        currency: 'usd',
        initialBalance: 10,
      }),
    ).rejects.toBeInstanceOf(ClientNotFoundError);
  });

  it('rejects negative initial balances', async () => {
    clientRepository.findById.mockResolvedValue({ id: 'client-1' });

    await expect(
      service.createAccount({
        clientId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        currency: 'usd',
        initialBalance: -1,
      }),
    ).rejects.toBeInstanceOf(InvalidInitialBalanceError);
  });
});
