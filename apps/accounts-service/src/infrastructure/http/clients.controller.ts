import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateClientUseCase } from '../../application/use-cases/create-client.use-case';
import { ListClientsUseCase } from '../../application/use-cases/list-clients.use-case';
import { AccountsExceptionFilter } from './accounts-exception.filter';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('Clients')
@UseFilters(AccountsExceptionFilter)
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly listClientsUseCase: ListClientsUseCase,
  ) {}

  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @Post()
  createClient(@Body() dto: CreateClientDto) {
    return this.createClientUseCase.execute({
      name: dto.name,
      email: dto.email,
    });
  }

  @ApiOperation({ summary: 'Listar clientes' })
  @Get()
  listClients() {
    return this.listClientsUseCase.execute();
  }
}
