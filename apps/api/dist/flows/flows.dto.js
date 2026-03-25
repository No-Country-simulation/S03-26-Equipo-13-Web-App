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
exports.UpdateFlowDto = exports.CreateFlowDto = exports.FlowStepDto = exports.FlowStepType = exports.FlowTrigger = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var FlowTrigger;
(function (FlowTrigger) {
    FlowTrigger["contact_created"] = "contact_created";
    FlowTrigger["status_changed"] = "status_changed";
    FlowTrigger["tag_added"] = "tag_added";
    FlowTrigger["manual"] = "manual";
})(FlowTrigger || (exports.FlowTrigger = FlowTrigger = {}));
var FlowStepType;
(function (FlowStepType) {
    FlowStepType["send_whatsapp"] = "send_whatsapp";
    FlowStepType["send_email"] = "send_email";
    FlowStepType["wait"] = "wait";
    FlowStepType["update_status"] = "update_status";
    FlowStepType["assign_tag"] = "assign_tag";
})(FlowStepType || (exports.FlowStepType = FlowStepType = {}));
class FlowStepDto {
    type;
    config;
}
exports.FlowStepDto = FlowStepDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FlowStepType }),
    (0, class_validator_1.IsEnum)(FlowStepType),
    __metadata("design:type", String)
], FlowStepDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payload del paso (mensaje, delay en ms, nuevo estado, etc.)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FlowStepDto.prototype, "config", void 0);
class CreateFlowDto {
    name;
    trigger;
    steps;
}
exports.CreateFlowDto = CreateFlowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bienvenida a nuevos contactos' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFlowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FlowTrigger }),
    (0, class_validator_1.IsEnum)(FlowTrigger),
    __metadata("design:type", String)
], CreateFlowDto.prototype, "trigger", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [FlowStepDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FlowStepDto),
    __metadata("design:type", Array)
], CreateFlowDto.prototype, "steps", void 0);
class UpdateFlowDto {
    active;
    name;
    steps;
}
exports.UpdateFlowDto = UpdateFlowDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateFlowDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFlowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [FlowStepDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FlowStepDto),
    __metadata("design:type", Array)
], UpdateFlowDto.prototype, "steps", void 0);
//# sourceMappingURL=flows.dto.js.map