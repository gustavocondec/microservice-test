import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AccountsService } from '../../application/services/accounts.service';
import { ClientsService } from '../../application/services/clients.service';
import { AccountsController } from './accounts.controller';
import { ClientsController } from './clients.controller';

describe('Accounts HTTP API (e2e)', () => {
  let app: INestApplication;

  const clientsService = {
    createClient: jest.fn(),
    listClients: jest.fn(),
  };
  const accountsService = {
    createAccount: jest.fn(),
    getAccount: jest.fn(),
    listAccountsByClient: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ClientsController, AccountsController],
      providers: [
        { provide: ClientsService, useValue: clientsService },
        { provide: AccountsService, useValue: accountsService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates clients and accounts through HTTP routes', async () => {
    clientsService.createClient.mockResolvedValue({
      id: 'client-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    accountsService.createAccount.mockResolvedValue({
      id: 'acc-1',
      clientId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
      currency: 'USD',
      balance: 100,
    });

    await request(app.getHttpServer())
      .post('/clients')
      .send({ name: 'Ada Lovelace', email: 'ada@example.com' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        clientId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        currency: 'usd',
        initialBalance: 100,
      })
      .expect(201);

    expect(response.body.balance).toBe(100);
  });

  it('lists clients through HTTP routes', async () => {
    clientsService.listClients.mockResolvedValue([
      {
        id: 'client-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/clients')
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 'client-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    ]);
  });
});
