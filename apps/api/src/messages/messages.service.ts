import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessagesGateway } from './messages.gateway';
import { WhatsappApiService } from './whatsapp-api.service';
import { SendWhatsappDto, SendEmailDto } from './messages.dto';
import { MessageDirection, MessageChannel, MessageStatus } from '@prisma/client';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: MessagesGateway,
    private readonly whatsappApi: WhatsappApiService,
  ) {}

  // ── GET /messages?contactId= ───────────────────────────────────────────────
  async findByContact(contactId: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) throw new NotFoundException(`Contacto ${contactId} no encontrado`);

    return this.prisma.message.findMany({
      where: { contactId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ── POST /messages/whatsapp ────────────────────────────────────────────────
  async sendWhatsapp(dto: SendWhatsappDto) {
    const contact = await this.prisma.contact.findUnique({ where: { id: dto.contactId } });
    if (!contact) throw new NotFoundException(`Contacto ${dto.contactId} no encontrado`);

    // Validate: must have either content or templateName
    if (!dto.content && !dto.templateName) {
      throw new BadRequestException('Se requiere content o templateName para enviar un mensaje de WhatsApp');
    }

    // Build the Meta payload
    const metaPayload = dto.templateName
      ? this.whatsappApi.buildTemplatePayload(
          contact.phone,
          dto.templateName,
          dto.templateVariables ?? [],
          dto.languageCode ?? 'es',
        )
      : this.whatsappApi.buildTextPayload(contact.phone, dto.content!);

    // Call Meta Cloud API — throws BadGatewayException on failure
    const metaResponse = await this.whatsappApi.send(metaPayload);
    const wamid = metaResponse.messages?.[0]?.id ?? null;

    // Persist message with the wamid so we can match status webhooks later
    const message = await this.prisma.message.create({
      data: {
        contactId: dto.contactId,
        content: dto.content ?? `[plantilla: ${dto.templateName}]`,
        direction: MessageDirection.outbound,
        channel: MessageChannel.whatsapp,
        status: MessageStatus.sent,
        wamid,
      },
    });

    this.gateway.emitNewMessage(dto.contactId, message);
    return message;
  }

  // ── POST /messages/email ───────────────────────────────────────────────────
  async sendEmail(dto: SendEmailDto) {
    const contact = await this.prisma.contact.findUnique({ where: { id: dto.contactId } });
    if (!contact) throw new NotFoundException(`Contacto ${dto.contactId} no encontrado`);

    // TODO: call Brevo SMTP once BREVO_API_KEY is configured
    this.logger.log(`[Email] → ${contact.email}: ${dto.subject}`);

    const message = await this.prisma.message.create({
      data: {
        contactId: dto.contactId,
        content: `${dto.subject}\n\n${dto.content}`,
        direction: MessageDirection.outbound,
        channel: MessageChannel.email,
        status: MessageStatus.sent,
      },
    });

    this.gateway.emitNewMessage(dto.contactId, message);
    return message;
  }

  // ── GET /messages/webhook/whatsapp — Meta verification challenge ──────────
  verifyWebhook(mode: string, token: string, challenge: string, verifyToken: string): string {
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp webhook verified successfully');
      return challenge;
    }
    throw new BadRequestException('Webhook verification failed — token mismatch');
  }

  // ── POST /messages/webhook/whatsapp — inbound messages + status updates ───
  async handleWhatsappWebhook(payload: any): Promise<{ received: boolean }> {
    try {
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      if (!value) return { received: true };

      // ── Status update (sent → delivered → read → failed) ──────────────────
      const statusUpdate = value?.statuses?.[0];
      if (statusUpdate) {
        await this.handleStatusUpdate(statusUpdate);
        return { received: true };
      }

      // ── Inbound message ───────────────────────────────────────────────────
      const inboundMessage = value?.messages?.[0];
      if (inboundMessage) {
        await this.handleInboundMessage(inboundMessage);
      }

      return { received: true };
    } catch (err) {
      // Always return 200 to Meta — if we return an error, Meta retries indefinitely
      this.logger.error('Webhook processing error', err);
      return { received: true };
    }
  }

  // ── Private: handle inbound message ───────────────────────────────────────
  private async handleInboundMessage(inbound: any) {
    const phone = inbound.from as string;
    const wamid = inbound.id as string;
    const text =
      inbound.type === 'text'
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
        direction: MessageDirection.inbound,
        channel: MessageChannel.whatsapp,
        status: MessageStatus.delivered,
        wamid,
      },
    });

    // Automatically mark as read on Meta's side
    await this.whatsappApi.markAsRead(wamid);

    this.gateway.emitNewMessage(contact.id, message);
  }

  // ── Private: handle status update ─────────────────────────────────────────
  private async handleStatusUpdate(statusEvent: any) {
    const wamid = statusEvent.id as string;
    const status = statusEvent.status as string; // sent | delivered | read | failed

    const statusMap: Record<string, MessageStatus> = {
      sent: MessageStatus.sent,
      delivered: MessageStatus.delivered,
      read: MessageStatus.read,
      failed: MessageStatus.failed,
    };

    const newStatus = statusMap[status];
    if (!newStatus) return;

    const message = await this.prisma.message.findUnique({ where: { wamid } });
    if (!message) {
      this.logger.warn(`Status webhook: no message found for wamid ${wamid}`);
      return;
    }

    const updated = await this.prisma.message.update({
      where: { wamid },
      data: { status: newStatus },
    });

    // Emit real-time update so the frontend chat updates the tick icons
    this.gateway.emitMessageStatusUpdate(message.contactId, {
      id: updated.id,
      wamid,
      status: newStatus,
    });

    if (status === 'failed') {
      const errorInfo = statusEvent.errors?.[0];
      this.logger.error(
        `Message ${wamid} failed — code ${errorInfo?.code}: ${errorInfo?.title}`,
      );
    }
  }
}
