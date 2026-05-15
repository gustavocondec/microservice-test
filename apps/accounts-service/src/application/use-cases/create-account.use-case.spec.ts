import { ClientNotFoundError } from '../../domain/errors/client-not-found.error';
import { InvalidInitialBalanceError } from '../../domain/errors/invalid-initial-balance.error';
import { CreateAccountUseCase } from './create-account.use-case';

describe('CreateAccountUseCase', () => {
  const accountRepository = {
    save: jest.fn(async (account) => account),
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

  let useCase: CreateAccountUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateAccountUseCase(
      accountRepository,
      clientRepository as never,
      eventsPublisher as never,
    );
  });

  it('rejects account creation when client does not exist', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        clientId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        currency: 'usd',
        initialBalance: 10,
      }),
    ).rejects.toBeInstanceOf(ClientNotFoundError);
  });

  it('rejects negative initial balances', async () => {
    clientRepository.findById.mockResolvedValue({ id: 'client-1' });

    await expect(
      useCase.execute({
        clientId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        currency: 'usd',
        initialBalance: -1,
      }),
    ).rejects.toBeInstanceOf(InvalidInitialBalanceError);
  });
});
