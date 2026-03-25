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
exports.FlowsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const flows_service_1 = require("./flows.service");
const flows_dto_1 = require("./flows.dto");
let FlowsController = class FlowsController {
    flowsService;
    constructor(flowsService) {
        this.flowsService = flowsService;
    }
    findAll() {
        return this.flowsService.findAll();
    }
    create(dto) {
        return this.flowsService.create(dto);
    }
    update(id, dto) {
        return this.flowsService.update(id, dto);
    }
};
exports.FlowsController = FlowsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar flujos con historial de ejecuciones recientes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear flujo con trigger, lista de pasos y condición de salida' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [flows_dto_1.CreateFlowDto]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Activar o pausar un flujo existente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, flows_dto_1.UpdateFlowDto]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "update", null);
exports.FlowsController = FlowsController = __decorate([
    (0, swagger_1.ApiTags)('flows'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('flows'),
    __metadata("design:paramtypes", [flows_service_1.FlowsService])
], FlowsController);
//# sourceMappingURL=flows.controller.js.map