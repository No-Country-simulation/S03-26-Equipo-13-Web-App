import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { MessagesService } from './messages.service';
import { SendWhatsappDto, SendEmailDto } from './messages.dto';
export declare class MessagesController {
    private readonly messagesService;
    private readonly config;
    constructor(messagesService: MessagesService, config: ConfigService);
    findByContact(contactId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.MessageStatus;
        contactId: string;
        content: string;
        direction: import(".prisma/client").$Enums.MessageDirection;
        channel: import(".prisma/client").$Enums.MessageChannel;
        wamid: string | null;
    }[]>;
    sendWhatsapp(dto: SendWhatsappDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.MessageStatus;
        contactId: string;
        content: string;
        direction: import(".prisma/client").$Enums.MessageDirection;
        channel: import(".prisma/client").$Enums.MessageChannel;
        wamid: string | null;
    }>;
    sendEmail(dto: SendEmailDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.MessageStatus;
        contactId: string;
        content: string;
        direction: import(".prisma/client").$Enums.MessageDirection;
        channel: import(".prisma/client").$Enums.MessageChannel;
        wamid: string | null;
    }>;
    verifyWebhook(mode: string, token: string, challenge: string, res: Response): void;
    handleWhatsappWebhook(payload: any): Promise<{
        received: boolean;
    }>;
}
