import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  const accountRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
  };
  const clientRepository = {
    findOne: jest.fn(),
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
    clientRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createAccount({
        clientId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        currency: 'usd',
        initialBalance: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects negative initial balances', async () => {
    clientRepository.findOne.mockResolvedValue({ id: 'client-1' });

    await expect(
      service.createAccount({
        clientId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        currency: 'usd',
        initialBalance: -1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
