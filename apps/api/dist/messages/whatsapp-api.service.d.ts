import { ConfigService } from '@nestjs/config';
export interface MetaTextPayload {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'text';
    text: {
        body: string;
        preview_url?: boolean;
    };
}
export interface MetaTemplatePayload {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'template';
    template: {
        name: string;
        language: {
            code: string;
        };
        components?: Array<{
            type: 'body' | 'header' | 'button';
            parameters: Array<{
                type: 'text';
                text: string;
            }>;
        }>;
    };
}
export interface MetaSendResponse {
    messaging_product: 'whatsapp';
    contacts: Array<{
        input: string;
        wa_id: string;
    }>;
    messages: Array<{
        id: string;
        message_status: string;
    }>;
}
export type MetaPayload = MetaTextPayload | MetaTemplatePayload;
export declare class WhatsappApiService {
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    constructor(config: ConfigService);
    private get token();
    private get phoneId();
    send(payload: MetaPayload): Promise<MetaSendResponse>;
    buildTextPayload(to: string, body: string): MetaTextPayload;
    buildTemplatePayload(to: string, templateName: string, variables?: string[], languageCode?: string): MetaTemplatePayload;
    markAsRead(wamid: string): Promise<void>;
}
