"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRejectionCode = exports.TransactionStatus = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAW"] = "WITHDRAW";
    TransactionType["TRANSFER"] = "TRANSFER";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["REJECTED"] = "REJECTED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TransactionRejectionCode;
(function (TransactionRejectionCode) {
    TransactionRejectionCode["ACCOUNT_NOT_FOUND"] = "ACCOUNT_NOT_FOUND";
    TransactionRejectionCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    TransactionRejectionCode["INVALID_REQUEST"] = "INVALID_REQUEST";
})(TransactionRejectionCode || (exports.TransactionRejectionCode = TransactionRejectionCode = {}));
