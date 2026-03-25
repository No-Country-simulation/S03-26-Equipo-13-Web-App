export declare class SendWhatsappDto {
    contactId: string;
    content?: string;
    templateName?: string;
    templateVariables?: string[];
    languageCode?: string;
}
export declare class SendEmailDto {
    contactId: string;
    subject: string;
    content: string;
    templateId?: string;
}
export declare enum MetaMessageStatus {
    sent = "sent",
    delivered = "delivered",
    read = "read",
    failed = "failed"
}
