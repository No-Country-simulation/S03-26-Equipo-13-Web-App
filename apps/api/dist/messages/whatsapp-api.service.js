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
var WhatsappApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WhatsappApiService = WhatsappApiService_1 = class WhatsappApiService {
    config;
    logger = new common_1.Logger(WhatsappApiService_1.name);
    baseUrl = 'https://graph.facebook.com/v19.0';
    constructor(config) {
        this.config = config;
    }
    get token() {
        return this.config.getOrThrow('WHATSAPP_TOKEN');
    }
    get phoneId() {
        return this.config.getOrThrow('WHATSAPP_PHONE_ID');
    }
    async send(payload) {
        const url = `${this.baseUrl}/${this.phoneId}/messages`;
        let lastError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`,
                    },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
                    const code = error?.error?.code;
                    const msg = error?.error?.message ?? res.statusText;
                    const permanent = [131030, 131047, 131051, 132000, 132001];
                    if (permanent.includes(code)) {
                        throw new common_1.BadGatewayException(`Meta error ${code}: ${msg}`);
                    }
                    throw new Error(`Meta HTTP ${res.status} (code ${code}): ${msg}`);
                }
                return (await res.json());
            }
            catch (err) {
                lastError = err;
                if (err instanceof common_1.BadGatewayException)
                    throw err;
                if (attempt < 3) {
                    const delay = attempt * 1000;
                    this.logger.warn(`Meta send attempt ${attempt} failed — retrying in ${delay}ms`);
                    await new Promise((r) => setTimeout(r, delay));
                }
            }
        }
        throw new common_1.BadGatewayException(`Meta API unreachable after 3 attempts: ${lastError?.message}`);
    }
    buildTextPayload(to, body) {
        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { body, preview_url: false },
        };
    }
    buildTemplatePayload(to, templateName, variables = [], languageCode = 'es') {
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
            },
        };
        if (variables.length > 0) {
            payload.template.components = [
                {
                    type: 'body',
                    parameters: variables.map((v) => ({ type: 'text', text: v })),
                },
            ];
        }
        return payload;
    }
    async markAsRead(wamid) {
        const url = `${this.baseUrl}/${this.phoneId}/messages`;
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: wamid,
            }),
        }).catch((err) => this.logger.warn(`markAsRead failed for ${wamid}: ${err.message}`));
    }
};
exports.WhatsappApiService = WhatsappApiService;
exports.WhatsappApiService = WhatsappApiService = WhatsappApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsappApiService);
//# sourceMappingURL=whatsapp-api.service.js.map