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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionDto = void 0;
const class_validator_1 = require("class-validator");
const contracts_1 = require("../../../../../../libs/contracts/src");
const swagger_1 = require("@nestjs/swagger");
class CreateTransactionDto {
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: contracts_1.TransactionType,
        example: contracts_1.TransactionType.TRANSFER,
        description: 'Tipo de transacción',
    }),
    (0, class_validator_1.IsEnum)(contracts_1.TransactionType),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 40,
        description: 'Monto de la transacción',
        minimum: 0.01,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
        description: 'Cuenta origen para retiros o transferencias',
    }),
    (0, class_validator_1.ValidateIf)((o) => o.type === contracts_1.TransactionType.WITHDRAW || o.type === contracts_1.TransactionType.TRANSFER),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "sourceAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'e9055df1-325c-4ce1-b8fb-c835f0927e8a',
        description: 'Cuenta destino para depósitos o transferencias',
    }),
    (0, class_validator_1.ValidateIf)((o) => o.type === contracts_1.TransactionType.DEPOSIT || o.type === contracts_1.TransactionType.TRANSFER),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "targetAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'transfer-001',
        description: 'Clave idempotente única por solicitud',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "idempotencyKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'corr-transfer-001',
        description: 'Identificador de correlación opcional',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "correlationId", void 0);
