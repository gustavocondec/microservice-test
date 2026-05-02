import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from '../../application/services/transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Registrar una nueva transacción' })
  @Post()
  createTransaction(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.createTransaction(dto);
  }

  @ApiOperation({ summary: 'Consultar el estado de una transacción' })
  @ApiParam({ name: 'transactionId', description: 'UUID de la transacción' })
  @Get(':transactionId')
  getTransaction(@Param('transactionId') transactionId: string) {
    return this.transactionsService.getTransaction(transactionId);
  }
}
