import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @ApiOperation({ summary: 'Healthcheck del servicio' })
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'accounts-service',
    };
  }
}
