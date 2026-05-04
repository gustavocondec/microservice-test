import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientsService } from '../../application/services/clients.service';
import { AccountsExceptionFilter } from './accounts-exception.filter';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('Clients')
@UseFilters(AccountsExceptionFilter)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @Post()
  createClient(@Body() dto: CreateClientDto) {
    return this.clientsService.createClient({
      name: dto.name,
      email: dto.email,
    });
  }

  @ApiOperation({ summary: 'Listar clientes' })
  @Get()
  listClients() {
    return this.clientsService.listClients();
  }
}
