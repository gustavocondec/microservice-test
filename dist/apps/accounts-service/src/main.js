"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const shared_1 = require("../../../libs/shared/src");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = Number(configService.get('PORT', '3001'));
    const logger = new common_1.Logger('AccountsBootstrap');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
    }));
    const swaggerPath = (0, shared_1.setupSwagger)(app, {
        title: 'Accounts Service API',
        description: 'API para gestión de clientes, cuentas bancarias y consulta de saldos.',
    });
    app.connectMicroservice((0, shared_1.buildKafkaOptions)(configService, 'accounts-service', 'accounts-service-group'));
    await app.startAllMicroservices();
    await app.listen(port);
    logger.log(`accounts-service listening on port ${port}`);
    logger.log(`Swagger available at /${swaggerPath}`);
}
bootstrap();
