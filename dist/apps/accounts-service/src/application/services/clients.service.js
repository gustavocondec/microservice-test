"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const contracts_1 = require("../../../../../libs/contracts/src");
const shared_1 = require("../../../../../libs/shared/src");
const client_entity_1 = require("../../infrastructure/persistence/entities/client.entity");
const accounts_events_publisher_1 = require("../../infrastructure/messaging/accounts-events.publisher");
let ClientsService = class ClientsService {
    constructor(clientRepository, accountsEventsPublisher) {
        this.clientRepository = clientRepository;
        this.accountsEventsPublisher = accountsEventsPublisher;
    }
    async createClient(dto) {
        const existingClient = await this.clientRepository.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (existingClient) {
            throw new common_1.ConflictException('A client with the same email already exists');
        }
        const client = this.clientRepository.create({
            id: (0, crypto_1.randomUUID)(),
            name: dto.name,
            email: dto.email.toLowerCase(),
        });
        await this.clientRepository.save(client);
        const event = {
            metadata: (0, shared_1.buildEventMetadata)(contracts_1.KafkaTopics.ClientCreated, client.id),
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
        return this.clientRepository.find({
            order: { createdAt: 'ASC' },
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.ClientEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accounts_events_publisher_1.AccountsEventsPublisher])
], ClientsService);
