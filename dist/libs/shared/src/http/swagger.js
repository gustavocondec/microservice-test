"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_1 = require("@nestjs/swagger");
const setupSwagger = (app, options) => {
    const path = options.path ?? 'docs';
    const document = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
        .setTitle(options.title)
        .setDescription(options.description)
        .setVersion(options.version ?? '1.0.0')
        .build());
    swagger_1.SwaggerModule.setup(path, app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    return path;
};
exports.setupSwagger = setupSwagger;
