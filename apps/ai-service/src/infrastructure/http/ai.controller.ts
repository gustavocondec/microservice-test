import { Controller, Get, Param, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetTransactionExplanationUseCase } from '../../application/use-cases/get-transaction-explanation.use-case';
import { SummarizeAccountUseCase } from '../../application/use-cases/summarize-account.use-case';
import { AiExceptionFilter } from './ai-exception.filter';

@ApiTags('AI')
@UseFilters(AiExceptionFilter)
@Controller()
export class AiController {
  constructor(
    private readonly getTransactionExplanationUseCase: GetTransactionExplanationUseCase,
    private readonly summarizeAccountUseCase: SummarizeAccountUseCase,
  ) {}

  @ApiOperation({ summary: 'Obtener explicación de una transacción' })
  @ApiParam({ name: 'transactionId', description: 'UUID de la transacción' })
  @Get('explanations/transactions/:transactionId')
  getTransactionExplanation(
    @Param('transactionId') transactionId: string,
  ): ReturnType<GetTransactionExplanationUseCase['execute']> {
    return this.getTransactionExplanationUseCase.execute(transactionId);
  }

  @ApiOperation({ summary: 'Obtener resumen de transacciones de una cuenta' })
  @ApiParam({ name: 'accountId', description: 'UUID de la cuenta' })
  @Get('summaries/accounts/:accountId')
  summarizeAccount(
    @Param('accountId') accountId: string,
  ): ReturnType<SummarizeAccountUseCase['execute']> {
    return this.summarizeAccountUseCase.execute(accountId);
  }
}
