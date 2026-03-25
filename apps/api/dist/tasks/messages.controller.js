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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const messages_service_1 = require("./messages.service");
const messages_dto_1 = require("./messages.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
let MessagesController = class MessagesController {
    messagesService;
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    findByContact(contactId) {
        return this.messagesService.findByContact(contactId);
    }
    sendWhatsapp(dto) {
        return this.messagesService.sendWhatsapp(dto);
    }
    sendEmail(dto) {
        return this.messagesService.sendEmail(dto);
    }
    handleWhatsappWebhook(payload) {
        return this.messagesService.handleWhatsappWebhook(payload);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Historial unificado WhatsApp + Email de un contacto' }),
    (0, swagger_1.ApiQuery)({ name: 'contactId', required: true }),
    __param(0, (0, common_1.Query)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findByContact", null);
__decorate([
    (0, common_1.Post)('whatsapp'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensaje de WhatsApp (texto libre o con plantilla)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof messages_dto_1.SendWhatsappDto !== "undefined" && messages_dto_1.SendWhatsappDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendWhatsapp", null);
__decorate([
    (0, common_1.Post)('email'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar email vía Brevo SMTP con plantilla opcional' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof messages_dto_1.SendEmailDto !== "undefined" && messages_dto_1.SendEmailDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendEmail", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhook/whatsapp'),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook de Meta — recibe mensajes entrantes de WhatsApp' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "handleWhatsappWebhook", null);
exports.MessagesController = MessagesController = __decorate([
    (0, swagger_1.ApiTags)('messages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [typeof (_a = typeof messages_service_1.MessagesService !== "undefined" && messages_service_1.MessagesService) === "function" ? _a : Object])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map