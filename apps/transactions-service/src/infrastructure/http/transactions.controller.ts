import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TransactionType } from '@app/contracts';
import { TransactionsService } from '../../application/services/transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsExceptionFilter } from './transactions-exception.filter';

@ApiTags('Transactions')
@UseFilters(TransactionsExceptionFilter)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Registrar una nueva transacción' })
  @ApiBody({
    type: CreateTransactionDto,
    examples: {
      deposit: {
        summary: 'Depósito',
        value: {
          type: TransactionType.DEPOSIT,
          amount: 100,
          targetAccountId: 'e9055df1-325c-4ce1-b8fb-c835f0927e8a',
          idempotencyKey: 'deposit-001',
          correlationId: 'corr-deposit-001',
        },
      },
      withdraw: {
        summary: 'Retiro',
        value: {
          type: TransactionType.WITHDRAW,
          amount: 25,
          sourceAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
          idempotencyKey: 'withdraw-001',
          correlationId: 'corr-withdraw-001',
        },
      },
      transfer: {
        summary: 'Transferencia',
        value: {
          type: TransactionType.TRANSFER,
          amount: 40,
          sourceAccountId: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
          targetAccountId: 'e9055df1-325c-4ce1-b8fb-c835f0927e8a',
          idempotencyKey: 'transfer-001',
          correlationId: 'corr-transfer-001',
        },
      },
    },
  })
  @Post()
  createTransaction(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.createTransaction({
      type: dto.type,
      amount: dto.amount,
      sourceAccountId: dto.sourceAccountId,
      targetAccountId: dto.targetAccountId,
      idempotencyKey: dto.idempotencyKey,
      correlationId: dto.correlationId,
    });
  }

  @ApiOperation({ summary: 'Consultar el estado de una transacción' })
  @ApiParam({ name: 'transactionId', description: 'UUID de la transacción' })
  @Get(':transactionId')
  getTransaction(@Param('transactionId') transactionId: string) {
    return this.transactionsService.getTransaction(transactionId);
  }
}
