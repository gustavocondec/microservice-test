"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const crypto_1 = require("crypto");
const contracts_1 = require("../../../../../libs/contracts/src");
const duplicate_client_email_error_1 = require("../../domain/errors/duplicate-client-email.error");
class ClientsService {
    constructor(clientRepository, accountsEventsPublisher) {
        this.clientRepository = clientRepository;
        this.accountsEventsPublisher = accountsEventsPublisher;
    }
    async createClient(input) {
        const email = input.email.toLowerCase();
        const existingClient = await this.clientRepository.findByEmail(email);
        if (existingClient) {
            throw new duplicate_client_email_error_1.DuplicateClientEmailError();
        }
        const client = await this.clientRepository.create({
            id: (0, crypto_1.randomUUID)(),
            name: input.name,
            email,
        });
        const event = {
            metadata: {
                eventId: (0, crypto_1.randomUUID)(),
                eventType: contracts_1.KafkaTopics.ClientCreated,
                occurredAt: new Date().toISOString(),
                correlationId: client.id,
            },
            payload: {
                clientId: client.id,
                name: client.name,
                email: client.email,
            },
        };
        await this.accountsEventsPublisher.publish(contracts_1.KafkaTopics.ClientCreated, event);
        return client;
    }
    async listClients() {
        return this.clientRepository.findAll();
    }
}
exports.ClientsService = ClientsService;
