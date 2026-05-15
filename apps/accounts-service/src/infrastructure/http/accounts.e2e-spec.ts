import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { CreateClientUseCase } from '../../application/use-cases/create-client.use-case';
import { GetAccountUseCase } from '../../application/use-cases/get-account.use-case';
import { ListAccountsByClientUseCase } from '../../application/use-cases/list-accounts-by-client.use-case';
import { ListClientsUseCase } from '../../application/use-cases/list-clients.use-case';
import { AccountsController } from './accounts.controller';
import { ClientsController } from './clients.controller';

describe('Accounts HTTP API (e2e)', () => {
  let app: INestApplication;

  const createClientUseCase = { execute: jest.fn() };
  const listClientsUseCase = { execute: jest.fn() };
  const createAccountUseCase = { execute: jest.fn() };
  const getAccountUseCase = { execute: jest.fn() };
  const listAccountsByClientUseCase = { execute: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ClientsController, AccountsController],
      providers: [
        { provide: CreateClientUseCase, useValue: createClientUseCase },
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: CreateAccountUseCase, useValue: createAccountUseCase },
        { provide: GetAccountUseCase, useValue: getAccountUseCase },
        { provide: ListAccountsByClientUseCase, useValue: listAccountsByClientUseCase },
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
    createClientUseCase.execute.mockResolvedValue({
      id: 'client-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    createAccountUseCase.execute.mockResolvedValue({
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
    listClientsUseCase.execute.mockResolvedValue([
      {
        id: 'client-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    ]);

    const response = await request(app.getHttpServer()).get('/clients').expect(200);

    expect(response.body).toEqual([
      {
        id: 'client-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    ]);
  });
});
