import { PrismaService } from 'src/prisma/prisma.service';
import { MessagesGateway } from './messages.gateway';
import { WhatsappApiService } from './whatsapp-api.service';
import { SendWhatsappDto, SendEmailDto } from './messages.dto';
export declare class MessagesService {
    private readonly prisma;
    private readonly gateway;
    private readonly whatsappApi;
    private readonly logger;
    constructor(prisma: PrismaService, gateway: MessagesGateway, whatsappApi: WhatsappApiService);
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
    verifyWebhook(mode: string, token: string, challenge: string, verifyToken: string): string;
    handleWhatsappWebhook(payload: any): Promise<{
        received: boolean;
    }>;
    private handleInboundMessage;
    private handleStatusUpdate;
}
