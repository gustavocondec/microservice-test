import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  type BalanceUpdatedPayload,
  type DomainEvent,
  KafkaTopics,
  TransactionRejectionCode,
  TransactionStatus,
  type TransactionCompletedPayload,
  type TransactionRejectedPayload,
  type TransactionRequestedPayload,
  TransactionType,
} from '@app/contracts';
import { buildEventMetadata, ProcessedEventsService } from '@app/shared';
import { BusinessRuleError } from '../../domain/errors/business-rule.error';
import { AccountsEventsPublisher } from '../../infrastructure/messaging/accounts-events.publisher';
import { AccountEntity } from '../../infrastructure/persistence/entities/account.entity';

type AccountMutationResult = {
  balanceEvents: Array<DomainEvent<BalanceUpdatedPayload>>;
  finalEvent: DomainEvent<TransactionCompletedPayload> | DomainEvent<TransactionRejectedPayload>;
};

@Injectable()
export class TransactionOrchestratorService {
  private readonly logger = new Logger(TransactionOrchestratorService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly processedEventsService: ProcessedEventsService,
    private readonly accountsEventsPublisher: AccountsEventsPublisher,
  ) {}

  async handleTransactionRequested(
    event: DomainEvent<TransactionRequestedPayload>,
  ): Promise<void> {
    if (await this.processedEventsService.hasProcessed(event.metadata.eventId)) {
      this.logger.warn(`Skipping already processed event ${event.metadata.eventId}`);
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
          metadata: buildEventMetadata(KafkaTopics.TransactionRejected, event.metadata.correlationId),
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
      await this.accountsEventsPublisher.publish(
        KafkaTopics.TransactionCompleted,
        completedEvent,
      );
    } else {
      const rejectedEvent = result.finalEvent as DomainEvent<TransactionRejectedPayload>;
      await this.accountsEventsPublisher.publish(
        KafkaTopics.TransactionRejected,
        rejectedEvent,
      );
    }

    await this.processedEventsService.markProcessed(
      event.metadata.eventId,
      event.metadata.eventType,
    );
  }

  private async applyTransaction(
    event: DomainEvent<TransactionRequestedPayload>,
  ): Promise<AccountMutationResult> {
    return this.dataSource.transaction(async (manager) => {
      const accountRepository = manager.getRepository(AccountEntity);
      const payload = event.payload;
      const accountsToPersist: AccountEntity[] = [];
      const balanceEvents: Array<DomainEvent<BalanceUpdatedPayload>> = [];

      switch (payload.type) {
        case TransactionType.DEPOSIT: {
          const targetAccount = await this.findRequiredAccount(accountRepository, payload.targetAccountId);
          targetAccount.balance = Number((targetAccount.balance + payload.amount).toFixed(2));
          accountsToPersist.push(targetAccount);
          balanceEvents.push(this.createBalanceEvent(targetAccount, payload.transactionId, event.metadata.correlationId));
          break;
        }
        case TransactionType.WITHDRAW: {
          const sourceAccount = await this.findRequiredAccount(accountRepository, payload.sourceAccountId);
          this.ensureFunds(sourceAccount, payload.amount);
          sourceAccount.balance = Number((sourceAccount.balance - payload.amount).toFixed(2));
          accountsToPersist.push(sourceAccount);
          balanceEvents.push(this.createBalanceEvent(sourceAccount, payload.transactionId, event.metadata.correlationId));
          break;
        }
        case TransactionType.TRANSFER: {
          const sourceAccount = await this.findRequiredAccount(accountRepository, payload.sourceAccountId);
          const targetAccount = await this.findRequiredAccount(accountRepository, payload.targetAccountId);

          this.ensureFunds(sourceAccount, payload.amount);
          sourceAccount.balance = Number((sourceAccount.balance - payload.amount).toFixed(2));
          targetAccount.balance = Number((targetAccount.balance + payload.amount).toFixed(2));
          accountsToPersist.push(sourceAccount, targetAccount);
          balanceEvents.push(
            this.createBalanceEvent(sourceAccount, payload.transactionId, event.metadata.correlationId),
            this.createBalanceEvent(targetAccount, payload.transactionId, event.metadata.correlationId),
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
        await accountRepository.save(accountsToPersist);
      }

      return {
        balanceEvents,
        finalEvent: {
          metadata: buildEventMetadata(KafkaTopics.TransactionCompleted, event.metadata.correlationId),
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
    repository: Repository<AccountEntity>,
    accountId: string | undefined,
  ): Promise<AccountEntity> {
    if (!accountId) {
      throw new BusinessRuleError(
        TransactionRejectionCode.INVALID_REQUEST,
        'Required account identifier is missing',
      );
    }

    const account = await repository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BusinessRuleError(
        TransactionRejectionCode.ACCOUNT_NOT_FOUND,
        `Account ${accountId} was not found`,
      );
    }

    return account;
  }

  private ensureFunds(account: AccountEntity, amount: number): void {
    if (account.balance < amount) {
      throw new BusinessRuleError(
        TransactionRejectionCode.INSUFFICIENT_FUNDS,
        `Account ${account.id} does not have enough funds`,
      );
    }
  }

  private createBalanceEvent(
    account: AccountEntity,
    transactionId: string,
    correlationId: string,
  ): DomainEvent<BalanceUpdatedPayload> {
    return {
      metadata: buildEventMetadata(KafkaTopics.BalanceUpdated, correlationId),
      payload: {
        accountId: account.id,
        clientId: account.clientId,
        balance: account.balance,
        transactionId,
      },
    };
  }
}
