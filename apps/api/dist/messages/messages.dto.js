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
exports.MetaMessageStatus = exports.SendEmailDto = exports.SendWhatsappDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SendWhatsappDto {
    contactId;
    content;
    templateName;
    templateVariables;
    languageCode;
}
exports.SendWhatsappDto = SendWhatsappDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del contacto destinatario' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendWhatsappDto.prototype, "contactId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Hola, ¿cómo estás?',
        description: 'Texto libre. Requerido si no se usa templateName.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendWhatsappDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'bienvenida_onboarding',
        description: 'Nombre exacto de la plantilla aprobada en Meta.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendWhatsappDto.prototype, "templateName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['Juan', 'Startup CRM'],
        description: 'Variables para reemplazar {{1}}, {{2}}... en la plantilla.',
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SendWhatsappDto.prototype, "templateVariables", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'es',
        default: 'es',
        description: 'Código de idioma de la plantilla.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendWhatsappDto.prototype, "languageCode", void 0);
class SendEmailDto {
    contactId;
    subject;
    content;
    templateId;
}
exports.SendEmailDto = SendEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del contacto destinatario' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "contactId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Seguimiento de propuesta' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hola Juan, te escribimos para...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de plantilla opcional' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "templateId", void 0);
var MetaMessageStatus;
(function (MetaMessageStatus) {
    MetaMessageStatus["sent"] = "sent";
    MetaMessageStatus["delivered"] = "delivered";
    MetaMessageStatus["read"] = "read";
    MetaMessageStatus["failed"] = "failed";
})(MetaMessageStatus || (exports.MetaMessageStatus = MetaMessageStatus = {}));
//# sourceMappingURL=messages.dto.js.map