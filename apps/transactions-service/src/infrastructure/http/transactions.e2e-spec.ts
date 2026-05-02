import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TransactionsService } from '../../application/services/transactions.service';
import { TransactionsController } from './transactions.controller';

describe('Transactions HTTP API (e2e)', () => {
  let app: INestApplication;

  const transactionsService = {
    createTransaction: jest.fn(),
    getTransaction: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [{ provide: TransactionsService, useValue: transactionsService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates and fetches transactions through HTTP routes', async () => {
    transactionsService.createTransaction.mockResolvedValue({
      id: 'tx-1',
      status: 'PENDING',
      amount: 25,
    });
    transactionsService.getTransaction.mockResolvedValue({
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

    const response = await request(app.getHttpServer())
      .get('/transactions/tx-1')
      .expect(200);

    expect(response.body.status).toBe('COMPLETED');
  });
});
