import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoClient } from '@getbrevo/brevo';
import { PrismaService } from '../prisma/prisma.service.js';
import { SendEmailDto } from './dto/send-email.dto.js';

interface SendResult {
  ok: boolean;
  data: unknown;
}

interface EmailHistoryItem {
  id: string;
  subject: string | null;
  content: string;
  direction: string;
  channel: string;
  status: string;
  contactId: string;
  createdAt: Date;
  contact: {
    id: string;
    name: string;
    email: string | null;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: BrevoClient;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.client = new BrevoClient({
      apiKey: this.config.getOrThrow<string>('BREVO_API_KEY'),
    });
    this.senderEmail = this.config.get<string>(
      'BREVO_SENDER_EMAIL',
      'no-reply@vigu.blog',
    );
    this.senderName = this.config.get<string>(
      'BREVO_SENDER_NAME',
      'Startup CRM',
    );
  }

  async send(dto: SendEmailDto): Promise<SendResult> {
    try {
      const response = await this.client.transactionalEmails.sendTransacEmail({
        subject: dto.subject,
        htmlContent: dto.htmlContent,
        sender: { email: this.senderEmail, name: this.senderName },
        to: [{ email: dto.to, name: dto.toName ?? dto.to }],
        ...(dto.replyTo ? { replyTo: { email: dto.replyTo } } : {}),
      });

      this.logger.log(`Email enviado a ${dto.to}`);

      if (dto.contactId) {
        await this.prisma.message.create({
          data: {
            subject: dto.subject,
            content: dto.htmlContent,
            direction: 'outbound',
            channel: 'email',
            status: 'sent',
            contactId: dto.contactId,
          },
        });
      }

      return { ok: true, data: response };
    } catch (err) {
      this.logger.error('Error enviando email via Brevo', err);
      throw new InternalServerErrorException('No se pudo enviar el email');
    }
  }

  async getHistory(contactId?: string): Promise<EmailHistoryItem[]> {
    return this.prisma.message.findMany({
      where: {
        channel: 'email',
        ...(contactId ? { contactId } : {}),
      },
      include: {
        contact: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
