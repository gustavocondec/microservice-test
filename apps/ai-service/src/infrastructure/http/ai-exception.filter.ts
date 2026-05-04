import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AiInsightNotFoundError } from '../../domain/errors/ai-insight-not-found.error';

@Catch(AiInsightNotFoundError)
export class AiExceptionFilter implements ExceptionFilter<AiInsightNotFoundError> {
  catch(exception: AiInsightNotFoundError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
      error: 'Not Found',
    });
  }
}
