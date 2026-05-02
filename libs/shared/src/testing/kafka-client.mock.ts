export const createKafkaClientMock = () => ({
  emit: jest.fn().mockReturnValue({
    toPromise: async () => undefined,
  }),
});
