import { randomUUID } from 'crypto';
import {
  type BalanceUpdatedPayload,
  type DomainEvent,
  type EventMetadata,
  KafkaTopics,
  TransactionRejectionCode,
  TransactionStatus,
  type TransactionCompletedPayload,
  type TransactionRejectedPayload,
  type TransactionRequestedPayload,
  TransactionType,
} from '@app/contracts';
import { type Account } from '../../domain/entities/account';
import { BusinessRuleError } from '../../domain/errors/business-rule.error';
import { type AccountsEventsPort } from '../ports/accounts-events.port';
import {
  type AccountsTransactionRepository,
  type AccountsUnitOfWork,
} from '../ports/accounts.repository';
import { type ProcessedEventsPort } from '../ports/processed-events.port';

interface AccountMutationResult {
  balanceEvents: DomainEvent<BalanceUpdatedPayload>[];
  finalEvent: DomainEvent<TransactionCompletedPayload> | DomainEvent<TransactionRejectedPayload>;
}

export class HandleTransactionRequestedUseCase {
  constructor(
    private readonly accountsUnitOfWork: AccountsUnitOfWork,
    private readonly processedEventsService: ProcessedEventsPort,
    private readonly accountsEventsPublisher: AccountsEventsPort,
  ) {}

  async execute(event: DomainEvent<TransactionRequestedPayload>): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      return;
    }

    let result: AccountMutationResult;

    try {
      result = await this.applyTransaction(event);
    } catch (error) {
      if (!(error instanceof BusinessRuleError)) {
        throw error;
      }

      result = {
        balanceEvents: [],
        finalEvent: {
          metadata: this.createEventMetadata(
            KafkaTopics.TransactionRejected,
            event.metadata.correlationId,
          ),
          payload: {
            transactionId: event.payload.transactionId,
            type: event.payload.type,
            status: TransactionStatus.REJECTED,
            amount: event.payload.amount,
            sourceAccountId: event.payload.sourceAccountId,
            targetAccountId: event.payload.targetAccountId,
            rejectedAt: new Date().toISOString(),
            reasonCode: error.code,
            reasonMessage: error.message,
          },
        },
      };
    }

    for (const balanceEvent of result.balanceEvents) {
      await this.accountsEventsPublisher.publish(KafkaTopics.BalanceUpdated, balanceEvent);
    }

    if ('completedAt' in result.finalEvent.payload) {
      const completedEvent = result.finalEvent as DomainEvent<TransactionCompletedPayload>;
      await this.accountsEventsPublisher.publish(KafkaTopics.TransactionCompleted, completedEvent);
    } else {
      const rejectedEvent = result.finalEvent as DomainEvent<TransactionRejectedPayload>;
      await this.accountsEventsPublisher.publish(KafkaTopics.TransactionRejected, rejectedEvent);
    }

    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }

  private async applyTransaction(
    event: DomainEvent<TransactionRequestedPayload>,
  ): Promise<AccountMutationResult> {
    return this.accountsUnitOfWork.run(async (accountRepository) => {
      const payload = event.payload;
      const accountsToPersist: Account[] = [];
      const balanceEvents: DomainEvent<BalanceUpdatedPayload>[] = [];

      switch (payload.type) {
        case TransactionType.DEPOSIT: {
          const targetAccount = await this.findRequiredAccount(
            accountRepository,
            payload.targetAccountId,
          );
          targetAccount.deposit(payload.amount);
          accountsToPersist.push(targetAccount);
          balanceEvents.push(
            this.createBalanceEvent(
              targetAccount,
              payload.transactionId,
              event.metadata.correlationId,
            ),
          );
          break;
        }
        case TransactionType.WITHDRAW: {
          const sourceAccount = await this.findRequiredAccount(
            accountRepository,
            payload.sourceAccountId,
          );
          sourceAccount.withdraw(payload.amount);
          accountsToPersist.push(sourceAccount);
          balanceEvents.push(
            this.createBalanceEvent(
              sourceAccount,
              payload.transactionId,
              event.metadata.correlationId,
            ),
          );
          break;
        }
        case TransactionType.TRANSFER: {
          const sourceAccount = await this.findRequiredAccount(
            accountRepository,
            payload.sourceAccountId,
          );
          const targetAccount = await this.findRequiredAccount(
            accountRepository,
            payload.targetAccountId,
          );

          sourceAccount.withdraw(payload.amount);
          targetAccount.deposit(payload.amount);
          accountsToPersist.push(sourceAccount, targetAccount);
          balanceEvents.push(
            this.createBalanceEvent(
              sourceAccount,
              payload.transactionId,
              event.metadata.correlationId,
            ),
            this.createBalanceEvent(
              targetAccount,
              payload.transactionId,
              event.metadata.correlationId,
            ),
          );
          break;
        }
        default:
          throw new BusinessRuleError(
            TransactionRejectionCode.INVALID_REQUEST,
            'Unsupported transaction type',
          );
      }

      if (accountsToPersist.length > 0) {
        await accountRepository.saveAll(accountsToPersist);
      }

      return {
        balanceEvents,
        finalEvent: {
          metadata: this.createEventMetadata(
            KafkaTopics.TransactionCompleted,
            event.metadata.correlationId,
          ),
          payload: {
            transactionId: payload.transactionId,
            type: payload.type,
            status: TransactionStatus.COMPLETED,
            amount: payload.amount,
            sourceAccountId: payload.sourceAccountId,
            targetAccountId: payload.targetAccountId,
            completedAt: new Date().toISOString(),
          },
        },
      };
    });
  }

  private async findRequiredAccount(
    repository: AccountsTransactionRepository,
    accountId: string | undefined,
  ): Promise<Account> {
    if (!accountId) {
      throw new BusinessRuleError(
        TransactionRejectionCode.INVALID_REQUEST,
        'Required account identifier is missing',
      );
    }

    const account = await repository.findById(accountId);

    if (!account) {
      throw new BusinessRuleError(
        TransactionRejectionCode.ACCOUNT_NOT_FOUND,
        `Account ${accountId} was not found`,
      );
    }

    return account;
  }

  private createBalanceEvent(
    account: Account,
    transactionId: string,
    correlationId: string,
  ): DomainEvent<BalanceUpdatedPayload> {
    return {
      metadata: this.createEventMetadata(KafkaTopics.BalanceUpdated, correlationId),
      payload: {
        accountId: account.id,
        clientId: account.clientId,
        balance: account.balance,
        transactionId,
      },
    };
  }

  private createEventMetadata(eventType: string, correlationId: string): EventMetadata {
    return {
      eventId: randomUUID(),
      eventType,
      occurredAt: new Date().toISOString(),
      correlationId,
    };
  }
}
