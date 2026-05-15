import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { GetAccountUseCase } from '../../application/use-cases/get-account.use-case';
import { ListAccountsByClientUseCase } from '../../application/use-cases/list-accounts-by-client.use-case';
import { AccountsExceptionFilter } from './accounts-exception.filter';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('Accounts')
@UseFilters(AccountsExceptionFilter)
@Controller()
export class AccountsController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly getAccountUseCase: GetAccountUseCase,
    private readonly listAccountsByClientUseCase: ListAccountsByClientUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear una cuenta bancaria' })
  @Post('accounts')
  createAccount(@Body() dto: CreateAccountDto): ReturnType<CreateAccountUseCase['execute']> {
    return this.createAccountUseCase.execute({
      clientId: dto.clientId,
      currency: dto.currency,
      initialBalance: dto.initialBalance,
    });
  }

  @ApiOperation({ summary: 'Obtener una cuenta por ID' })
  @ApiParam({ name: 'accountId', description: 'UUID de la cuenta bancaria' })
  @Get('accounts/:accountId')
  getAccount(@Param('accountId') accountId: string): ReturnType<GetAccountUseCase['execute']> {
    return this.getAccountUseCase.execute(accountId);
  }

  @ApiOperation({ summary: 'Listar cuentas de un cliente' })
  @ApiParam({ name: 'clientId', description: 'UUID del cliente' })
  @Get('clients/:clientId/accounts')
  listAccounts(
    @Param('clientId') clientId: string,
  ): ReturnType<ListAccountsByClientUseCase['execute']> {
    return this.listAccountsByClientUseCase.execute(clientId);
  }
}
