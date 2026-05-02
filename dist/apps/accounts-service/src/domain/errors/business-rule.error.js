"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleError = void 0;
class BusinessRuleError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.BusinessRuleError = BusinessRuleError;
