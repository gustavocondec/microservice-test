import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidTransactionError } from '../../domain/errors/invalid-transaction.error';
import { TransactionNotFoundError } from '../../domain/errors/transaction-not-found.error';

type TransactionsHttpError = InvalidTransactionError | TransactionNotFoundError;

@Catch(InvalidTransactionError, TransactionNotFoundError)
export class TransactionsExceptionFilter implements ExceptionFilter<TransactionsHttpError> {
  catch(exception: TransactionsHttpError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof InvalidTransactionError
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.NOT_FOUND;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: status === HttpStatus.BAD_REQUEST ? 'Bad Request' : 'Not Found',
    });
  }
}
