import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
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
  private readonly brevoUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  async send(dto: SendEmailDto): Promise<SendResult> {
    // Resolve credentials from Settings DB first, then env fallback
    const apiKey = await this.settings.get('BREVO_API_KEY');
    if (!apiKey) {
      throw new BadRequestException(
        'Brevo API Key no configurada. Ve a Configuración para añadirla.',
      );
    }

    const senderEmail =
      (await this.settings.get('BREVO_SENDER_EMAIL')) ?? 'no-reply@vigu.blog';
    const senderName =
      (await this.settings.get('BREVO_SENDER_NAME')) ?? 'Startup CRM';

    const body: Record<string, unknown> = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: dto.to, name: dto.toName ?? dto.to }],
      subject: dto.subject,
      htmlContent: dto.htmlContent,
      ...(dto.replyTo ? { replyTo: { email: dto.replyTo } } : {}),
    };

    const res = await fetch(this.brevoUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error(`Error enviando email via Brevo: ${JSON.stringify(err)}`);
      throw new BadRequestException(
        `Fallo en proveedor de correo: ${(err as any)?.message ?? res.statusText}`,
      );
    }

    const data = await res.json().catch(() => ({}));
    this.logger.log(`Email enviado a ${dto.to}`);

    // Persist in messages table for history
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

    return { ok: true, data };
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
