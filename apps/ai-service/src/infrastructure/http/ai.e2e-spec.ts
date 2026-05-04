import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { GetTransactionExplanationUseCase } from '../../application/use-cases/get-transaction-explanation.use-case';
import { SummarizeAccountUseCase } from '../../application/use-cases/summarize-account.use-case';
import { AiController } from './ai.controller';

describe('AI HTTP API (e2e)', () => {
  let app: INestApplication;

  const getTransactionExplanationUseCase = { execute: jest.fn() };
  const summarizeAccountUseCase = { execute: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: GetTransactionExplanationUseCase, useValue: getTransactionExplanationUseCase },
        { provide: SummarizeAccountUseCase, useValue: summarizeAccountUseCase },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns generated explanations and summaries', async () => {
    getTransactionExplanationUseCase.execute.mockResolvedValue({
      transactionId: 'tx-1',
      explanation: 'Transfer tx-1 completed successfully.',
    });
    summarizeAccountUseCase.execute.mockResolvedValue({
      accountId: 'acc-1',
      summary: 'Account acc-1 has 1 tracked transactions.',
    });

    const explanationResponse = await request(app.getHttpServer())
      .get('/explanations/transactions/tx-1')
      .expect(200);

    const summaryResponse = await request(app.getHttpServer())
      .get('/summaries/accounts/acc-1')
      .expect(200);

    expect(explanationResponse.body.explanation).toContain('completed successfully');
    expect(summaryResponse.body.summary).toContain('tracked transactions');
  });
});
