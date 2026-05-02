export const KafkaTopics = {
  ClientCreated: 'client.created',
  AccountCreated: 'account.created',
  BalanceUpdated: 'balance.updated',
  TransactionRequested: 'transaction.requested',
  TransactionCompleted: 'transaction.completed',
  TransactionRejected: 'transaction.rejected',
} as const;

export type KafkaTopic = (typeof KafkaTopics)[keyof typeof KafkaTopics];
