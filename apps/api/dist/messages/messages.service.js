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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const messages_gateway_1 = require("./messages.gateway");
const whatsapp_api_service_1 = require("./whatsapp-api.service");
const client_1 = require("@prisma/client");
let MessagesService = MessagesService_1 = class MessagesService {
    prisma;
    gateway;
    whatsappApi;
    logger = new common_1.Logger(MessagesService_1.name);
    constructor(prisma, gateway, whatsappApi) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.whatsappApi = whatsappApi;
    }
    async findByContact(contactId) {
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact)
            throw new common_1.NotFoundException(`Contacto ${contactId} no encontrado`);
        return this.prisma.message.findMany({
            where: { contactId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async sendWhatsapp(dto) {
        const contact = await this.prisma.contact.findUnique({ where: { id: dto.contactId } });
        if (!contact)
            throw new common_1.NotFoundException(`Contacto ${dto.contactId} no encontrado`);
        if (!dto.content && !dto.templateName) {
            throw new common_1.BadRequestException('Se requiere content o templateName para enviar un mensaje de WhatsApp');
        }
        const metaPayload = dto.templateName
            ? this.whatsappApi.buildTemplatePayload(contact.phone, dto.templateName, dto.templateVariables ?? [], dto.languageCode ?? 'es')
            : this.whatsappApi.buildTextPayload(contact.phone, dto.content);
        const metaResponse = await this.whatsappApi.send(metaPayload);
        const wamid = metaResponse.messages?.[0]?.id ?? null;
        const message = await this.prisma.message.create({
            data: {
                contactId: dto.contactId,
                content: dto.content ?? `[plantilla: ${dto.templateName}]`,
                direction: client_1.MessageDirection.outbound,
                channel: client_1.MessageChannel.whatsapp,
                status: client_1.MessageStatus.sent,
                wamid,
            },
        });
        this.gateway.emitNewMessage(dto.contactId, message);
        return message;
    }
    async sendEmail(dto) {
        const contact = await this.prisma.contact.findUnique({ where: { id: dto.contactId } });
        if (!contact)
            throw new common_1.NotFoundException(`Contacto ${dto.contactId} no encontrado`);
        this.logger.log(`[Email] → ${contact.email}: ${dto.subject}`);
        const message = await this.prisma.message.create({
            data: {
                contactId: dto.contactId,
                content: `${dto.subject}\n\n${dto.content}`,
                direction: client_1.MessageDirection.outbound,
                channel: client_1.MessageChannel.email,
                status: client_1.MessageStatus.sent,
            },
        });
        this.gateway.emitNewMessage(dto.contactId, message);
        return message;
    }
    verifyWebhook(mode, token, challenge, verifyToken) {
        if (mode === 'subscribe' && token === verifyToken) {
            this.logger.log('WhatsApp webhook verified successfully');
            return challenge;
        }
        throw new common_1.BadRequestException('Webhook verification failed — token mismatch');
    }
    async handleWhatsappWebhook(payload) {
        try {
            const entry = payload?.entry?.[0];
            const change = entry?.changes?.[0];
            const value = change?.value;
            if (!value)
                return { received: true };
            const statusUpdate = value?.statuses?.[0];
            if (statusUpdate) {
                await this.handleStatusUpdate(statusUpdate);
                return { received: true };
            }
            const inboundMessage = value?.messages?.[0];
            if (inboundMessage) {
                await this.handleInboundMessage(inboundMessage);
            }
            return { received: true };
        }
        catch (err) {
            this.logger.error('Webhook processing error', err);
            return { received: true };
        }
    }
    async handleInboundMessage(inbound) {
        const phone = inbound.from;
        const wamid = inbound.id;
        const text = inbound.type === 'text'
            ? inbound.text?.body
            : inbound.type === 'image'
                ? '[imagen]'
                : inbound.type === 'audio'
                    ? '[audio]'
                    : inbound.type === 'document'
                        ? '[documento]'
                        : `[${inbound.type ?? 'media'}]`;
        const contact = await this.prisma.contact.findUnique({ where: { phone } });
        if (!contact) {
            this.logger.warn(`Webhook: no contact found for phone ${phone}`);
            return;
        }
        const message = await this.prisma.message.create({
            data: {
                contactId: contact.id,
                content: text,
                direction: client_1.MessageDirection.inbound,
                channel: client_1.MessageChannel.whatsapp,
                status: client_1.MessageStatus.delivered,
                wamid,
            },
        });
        await this.whatsappApi.markAsRead(wamid);
        this.gateway.emitNewMessage(contact.id, message);
    }
    async handleStatusUpdate(statusEvent) {
        const wamid = statusEvent.id;
        const status = statusEvent.status;
        const statusMap = {
            sent: client_1.MessageStatus.sent,
            delivered: client_1.MessageStatus.delivered,
            read: client_1.MessageStatus.read,
            failed: client_1.MessageStatus.failed,
        };
        const newStatus = statusMap[status];
        if (!newStatus)
            return;
        const message = await this.prisma.message.findUnique({ where: { wamid } });
        if (!message) {
            this.logger.warn(`Status webhook: no message found for wamid ${wamid}`);
            return;
        }
        const updated = await this.prisma.message.update({
            where: { wamid },
            data: { status: newStatus },
        });
        this.gateway.emitMessageStatusUpdate(message.contactId, {
            id: updated.id,
            wamid,
            status: newStatus,
        });
        if (status === 'failed') {
            const errorInfo = statusEvent.errors?.[0];
            this.logger.error(`Message ${wamid} failed — code ${errorInfo?.code}: ${errorInfo?.title}`);
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messages_gateway_1.MessagesGateway,
        whatsapp_api_service_1.WhatsappApiService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map