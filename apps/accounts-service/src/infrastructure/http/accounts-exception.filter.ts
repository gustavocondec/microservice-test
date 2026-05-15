import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AccountNotFoundError } from '../../domain/errors/account-not-found.error';
import { ClientNotFoundError } from '../../domain/errors/client-not-found.error';
import { DuplicateClientEmailError } from '../../domain/errors/duplicate-client-email.error';
import { InvalidInitialBalanceError } from '../../domain/errors/invalid-initial-balance.error';

type AccountsHttpError =
  | AccountNotFoundError
  | ClientNotFoundError
  | DuplicateClientEmailError
  | InvalidInitialBalanceError;

@Catch(
  AccountNotFoundError,
  ClientNotFoundError,
  DuplicateClientEmailError,
  InvalidInitialBalanceError,
)
export class AccountsExceptionFilter implements ExceptionFilter<AccountsHttpError> {
  catch(exception: AccountsHttpError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.getStatus(exception);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: this.getErrorLabel(status),
    });
  }

  private getStatus(exception: AccountsHttpError): HttpStatus {
    if (exception instanceof DuplicateClientEmailError) {
      return HttpStatus.CONFLICT;
    }

    if (exception instanceof InvalidInitialBalanceError) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.NOT_FOUND;
  }

  private getErrorLabel(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      default:
        return 'Not Found';
    }
  }
}
