import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (
  app: INestApplication,
  options: {
    title: string;
    description: string;
    version?: string;
    path?: string;
  },
): string => {
  const path = options.path ?? 'docs';
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(options.title)
      .setDescription(options.description)
      .setVersion(options.version ?? '1.0.0')
      .build(),
  );

  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  return path;
};
