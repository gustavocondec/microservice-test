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
exports.ProcessedEventEntity = void 0;
const typeorm_1 = require("typeorm");
let ProcessedEventEntity = class ProcessedEventEntity {
};
exports.ProcessedEventEntity = ProcessedEventEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'event_id', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ProcessedEventEntity.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_type', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], ProcessedEventEntity.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ProcessedEventEntity.prototype, "processedAt", void 0);
exports.ProcessedEventEntity = ProcessedEventEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'processed_events' })
], ProcessedEventEntity);
