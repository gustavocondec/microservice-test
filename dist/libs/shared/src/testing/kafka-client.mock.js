"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKafkaClientMock = void 0;
const createKafkaClientMock = () => ({
    emit: jest.fn().mockReturnValue({
        toPromise: async () => undefined,
    }),
});
exports.createKafkaClientMock = createKafkaClientMock;
