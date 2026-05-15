export const createKafkaClientMock = (): {
  emit: jest.Mock<{ toPromise: () => Promise<void> }, []>;
} => ({
  emit: jest.fn<{ toPromise: () => Promise<void> }, []>(() => ({
    toPromise: () => Promise.resolve(),
  })),
});
