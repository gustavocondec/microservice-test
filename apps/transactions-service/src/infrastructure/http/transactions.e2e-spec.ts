import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { TransactionsController } from './transactions.controller';

describe('Transactions HTTP API (e2e)', () => {
  let app: INestApplication;

  const createTransactionUseCase = { execute: jest.fn() };
  const getTransactionUseCase = { execute: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: CreateTransactionUseCase, useValue: createTransactionUseCase },
        { provide: GetTransactionUseCase, useValue: getTransactionUseCase },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates and fetches transactions through HTTP routes', async () => {
    createTransactionUseCase.execute.mockResolvedValue({
      id: 'tx-1',
      status: 'PENDING',
      amount: 25,
    });
    getTransactionUseCase.execute.mockResolvedValue({
      id: 'tx-1',
      status: 'COMPLETED',
      amount: 25,
    });

    await request(app.getHttpServer())
      .post('/transactions')
      .send({
        type: 'DEPOSIT',
        amount: 25,
        targetAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        idempotencyKey: 'idem-1',
      })
      .expect(201);

    const response = await request(app.getHttpServer()).get('/transactions/tx-1').expect(200);

    expect(response.body.status).toBe('COMPLETED');
  });
});
