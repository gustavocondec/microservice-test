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
exports.AccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_account_use_case_1 = require("../../application/use-cases/create-account.use-case");
const get_account_use_case_1 = require("../../application/use-cases/get-account.use-case");
const list_accounts_by_client_use_case_1 = require("../../application/use-cases/list-accounts-by-client.use-case");
const accounts_exception_filter_1 = require("./accounts-exception.filter");
const create_account_dto_1 = require("./dto/create-account.dto");
let AccountsController = class AccountsController {
    constructor(createAccountUseCase, getAccountUseCase, listAccountsByClientUseCase) {
        this.createAccountUseCase = createAccountUseCase;
        this.getAccountUseCase = getAccountUseCase;
        this.listAccountsByClientUseCase = listAccountsByClientUseCase;
    }
    createAccount(dto) {
        return this.createAccountUseCase.execute({
            clientId: dto.clientId,
            currency: dto.currency,
            initialBalance: dto.initialBalance,
        });
    }
    getAccount(accountId) {
        return this.getAccountUseCase.execute(accountId);
    }
    listAccounts(clientId) {
        return this.listAccountsByClientUseCase.execute(clientId);
    }
};
exports.AccountsController = AccountsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Crear una cuenta bancaria' }),
    (0, common_1.Post)('accounts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_account_dto_1.CreateAccountDto]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "createAccount", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una cuenta por ID' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'UUID de la cuenta bancaria' }),
    (0, common_1.Get)('accounts/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getAccount", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar cuentas de un cliente' }),
    (0, swagger_1.ApiParam)({ name: 'clientId', description: 'UUID del cliente' }),
    (0, common_1.Get)('clients/:clientId/accounts'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "listAccounts", null);
exports.AccountsController = AccountsController = __decorate([
    (0, swagger_1.ApiTags)('Accounts'),
    (0, common_1.UseFilters)(accounts_exception_filter_1.AccountsExceptionFilter),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [create_account_use_case_1.CreateAccountUseCase,
        get_account_use_case_1.GetAccountUseCase,
        list_accounts_by_client_use_case_1.ListAccountsByClientUseCase])
], AccountsController);
