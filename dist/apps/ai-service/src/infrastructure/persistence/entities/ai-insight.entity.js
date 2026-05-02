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
exports.AiInsightEntity = void 0;
const typeorm_1 = require("typeorm");
const contracts_1 = require("../../../../../../libs/contracts/src");
const numericTransformer = {
    to: (value) => value,
    from: (value) => Number(value),
};
let AiInsightEntity = class AiInsightEntity {
};
exports.AiInsightEntity = AiInsightEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], AiInsightEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id', type: 'varchar', length: 36, unique: true }),
    __metadata("design:type", String)
], AiInsightEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], AiInsightEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], AiInsightEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 14, scale: 2, transformer: numericTransformer }),
    __metadata("design:type", Number)
], AiInsightEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_account_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], AiInsightEntity.prototype, "sourceAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_account_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", Object)
], AiInsightEntity.prototype, "targetAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reason_code', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], AiInsightEntity.prototype, "reasonCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AiInsightEntity.prototype, "explanation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AiInsightEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AiInsightEntity.prototype, "updatedAt", void 0);
exports.AiInsightEntity = AiInsightEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'ai_insights' })
], AiInsightEntity);
