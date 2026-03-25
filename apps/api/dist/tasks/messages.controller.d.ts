import { MessagesService } from './messages.service';
import { SendWhatsappDto, SendEmailDto } from './messages.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findByContact(contactId: string): any;
    sendWhatsapp(dto: SendWhatsappDto): any;
    sendEmail(dto: SendEmailDto): any;
    handleWhatsappWebhook(payload: any): any;
}
