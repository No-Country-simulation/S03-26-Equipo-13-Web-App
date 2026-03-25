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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const messages_service_1 = require("./messages.service");
const messages_dto_1 = require("./messages.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
let MessagesController = class MessagesController {
    messagesService;
    config;
    constructor(messagesService, config) {
        this.messagesService = messagesService;
        this.config = config;
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
    verifyWebhook(mode, token, challenge, res) {
        const verifyToken = this.config.getOrThrow('WEBHOOK_VERIFY_TOKEN');
        const result = this.messagesService.verifyWebhook(mode, token, challenge, verifyToken);
        res.status(200).send(result);
    }
    handleWhatsappWebhook(payload) {
        return this.messagesService.handleWhatsappWebhook(payload);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Historial unificado de mensajes de un contacto',
        description: 'Devuelve todos los mensajes (WhatsApp + Email) de un contacto ordenados por fecha ascendente.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'contactId', required: true, description: 'ID del contacto' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de mensajes del contacto' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contacto no encontrado' }),
    __param(0, (0, common_1.Query)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findByContact", null);
__decorate([
    (0, common_1.Post)('whatsapp'),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar mensaje de WhatsApp',
        description: 'Envía un mensaje de WhatsApp usando texto libre o una plantilla aprobada por Meta. ' +
            'Si se usa plantilla, `templateName` es requerido. ' +
            'Las variables de la plantilla ({{1}}, {{2}}...) se pasan en `templateVariables`.',
    }),
    (0, swagger_1.ApiBody)({ type: messages_dto_1.SendWhatsappDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mensaje enviado y guardado en BD con wamid de Meta' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Falta content o templateName' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contacto no encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 502, description: 'Error de Meta Cloud API' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [messages_dto_1.SendWhatsappDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendWhatsapp", null);
__decorate([
    (0, common_1.Post)('email'),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar email vía Brevo SMTP',
        description: 'Envía un email al contacto usando Brevo. Requiere BREVO_API_KEY en .env.',
    }),
    (0, swagger_1.ApiBody)({ type: messages_dto_1.SendEmailDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Email enviado y guardado en BD' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contacto no encontrado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [messages_dto_1.SendEmailDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendEmail", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('webhook/whatsapp'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificación del webhook de Meta (GET)',
        description: 'Meta llama a este endpoint cuando configuras el webhook en el portal de desarrolladores. ' +
            'Responde con el challenge para verificar la URL. ' +
            'Requiere que WEBHOOK_VERIFY_TOKEN en .env coincida con el token configurado en Meta.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'hub.mode', required: true, example: 'subscribe' }),
    (0, swagger_1.ApiQuery)({ name: 'hub.verify_token', required: true, example: 'mi-token-secreto-2026' }),
    (0, swagger_1.ApiQuery)({ name: 'hub.challenge', required: true, example: '1234567890' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Challenge devuelto — webhook verificado' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Token incorrecto — verificación fallida' }),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "verifyWebhook", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhook/whatsapp'),
    (0, swagger_1.ApiOperation)({
        summary: 'Webhook de Meta (POST) — mensajes entrantes y actualizaciones de estado',
        description: 'Meta llama a este endpoint cuando:\n' +
            '- Un usuario envía un mensaje de WhatsApp al negocio\n' +
            '- El estado de un mensaje cambia (sent → delivered → read → failed)\n\n' +
            'Este endpoint siempre responde 200 para evitar reintentos de Meta. ' +
            'Los mensajes entrantes se guardan en BD y se emiten por Socket.io. ' +
            'Las actualizaciones de estado actualizan el campo `status` del mensaje por `wamid`.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recibido correctamente' }),
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
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        config_1.ConfigService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map