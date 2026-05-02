import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AiInsightsService } from '../../application/services/ai-insights.service';

@ApiTags('AI')
@Controller()
export class AiController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @ApiOperation({ summary: 'Obtener explicación de una transacción' })
  @ApiParam({ name: 'transactionId', description: 'UUID de la transacción' })
  @Get('explanations/transactions/:transactionId')
  getTransactionExplanation(@Param('transactionId') transactionId: string) {
    return this.aiInsightsService.getTransactionExplanation(transactionId);
  }

  @ApiOperation({ summary: 'Obtener resumen de transacciones de una cuenta' })
  @ApiParam({ name: 'accountId', description: 'UUID de la cuenta' })
  @Get('summaries/accounts/:accountId')
  summarizeAccount(@Param('accountId') accountId: string) {
    return this.aiInsightsService.summarizeAccount(accountId);
  }
}
