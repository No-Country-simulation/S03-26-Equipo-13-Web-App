import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { WhatsappApiService } from './whatsapp-api.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageDirection, MessageChannel, MessageStatus } from '@prisma/client';

// ── Mocks ──────────────────────────────────────────────────────────────────────
const mockPrismaContact = { findUnique: jest.fn() };
const mockPrismaMessage = { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn() };
const mockPrismaService = { contact: mockPrismaContact, message: mockPrismaMessage };

const mockGateway = {
  emitNewMessage: jest.fn(),
  emitMessageStatusUpdate: jest.fn(),
};

const mockWhatsappApi = {
  send: jest.fn(),
  buildTextPayload: jest.fn(),
  buildTemplatePayload: jest.fn(),
  markAsRead: jest.fn(),
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const mockContact = { id: 'contact-1', name: 'Juan', phone: '+573001234567', email: 'juan@test.com' };
const mockMessage = {
  id: 'msg-1', content: 'Hola!',
  direction: MessageDirection.outbound, channel: MessageChannel.whatsapp,
  status: MessageStatus.sent, contactId: 'contact-1', wamid: 'wamid_abc123', createdAt: new Date(),
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MessagesGateway, useValue: mockGateway },
        { provide: WhatsappApiService, useValue: mockWhatsappApi },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    (service as any).prisma = mockPrismaService;
    (service as any).gateway = mockGateway;
    (service as any).whatsappApi = mockWhatsappApi;
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ── findByContact ─────────────────────────────────────────────────────────
  describe('findByContact', () => {
    it('should return messages for a contact', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockPrismaMessage.findMany.mockResolvedValue([mockMessage]);
      const result = await service.findByContact('contact-1');
      expect(mockPrismaMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { contactId: 'contact-1' } }),
      );
      expect(result).toEqual([mockMessage]);
    });

    it('should throw NotFoundException when contact does not exist', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);
      await expect(service.findByContact('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ── sendWhatsapp ──────────────────────────────────────────────────────────
  describe('sendWhatsapp', () => {
    it('should build text payload, call Meta API, save wamid and emit socket event', async () => {
      const textPayload = { messaging_product: 'whatsapp', type: 'text' };
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockWhatsappApi.buildTextPayload.mockReturnValue(textPayload);
      mockWhatsappApi.send.mockResolvedValue({ messages: [{ id: 'wamid_abc123' }] });
      mockPrismaMessage.create.mockResolvedValue(mockMessage);

      const result = await service.sendWhatsapp({ contactId: 'contact-1', content: 'Hola!' });

      expect(mockWhatsappApi.buildTextPayload).toHaveBeenCalledWith(mockContact.phone, 'Hola!');
      expect(mockWhatsappApi.send).toHaveBeenCalledWith(textPayload);
      expect(mockPrismaMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ wamid: 'wamid_abc123', status: MessageStatus.sent }),
        }),
      );
      expect(mockGateway.emitNewMessage).toHaveBeenCalledWith('contact-1', mockMessage);
      expect(result).toEqual(mockMessage);
    });

    it('should build template payload when templateName is provided', async () => {
      const templatePayload = { messaging_product: 'whatsapp', type: 'template' };
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockWhatsappApi.buildTemplatePayload.mockReturnValue(templatePayload);
      mockWhatsappApi.send.mockResolvedValue({ messages: [{ id: 'wamid_tpl_001' }] });
      mockPrismaMessage.create.mockResolvedValue(mockMessage);

      await service.sendWhatsapp({
        contactId: 'contact-1',
        templateName: 'bienvenida',
        templateVariables: ['Juan'],
        languageCode: 'es',
      });

      expect(mockWhatsappApi.buildTemplatePayload).toHaveBeenCalledWith(
        mockContact.phone, 'bienvenida', ['Juan'], 'es',
      );
      expect(mockWhatsappApi.send).toHaveBeenCalledWith(templatePayload);
    });

    it('should throw BadRequestException when neither content nor templateName is provided', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      await expect(service.sendWhatsapp({ contactId: 'contact-1' })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when contact does not exist', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);
      await expect(service.sendWhatsapp({ contactId: 'nonexistent', content: 'hi' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── verifyWebhook ─────────────────────────────────────────────────────────
  describe('verifyWebhook', () => {
    it('should return the challenge when mode and token are correct', () => {
      const result = service.verifyWebhook('subscribe', 'mi-token', '123456', 'mi-token');
      expect(result).toBe('123456');
    });

    it('should throw BadRequestException when token does not match', () => {
      expect(() =>
        service.verifyWebhook('subscribe', 'wrong-token', '123456', 'mi-token'),
      ).toThrow(BadRequestException);
    });
  });

  // ── handleWhatsappWebhook — inbound ───────────────────────────────────────
  describe('handleWhatsappWebhook — inbound message', () => {
    it('should save inbound message, mark as read, and emit socket event', async () => {
      const inboundMsg = { ...mockMessage, direction: MessageDirection.inbound };
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockPrismaMessage.create.mockResolvedValue(inboundMsg);
      mockWhatsappApi.markAsRead.mockResolvedValue(undefined);

      const payload = {
        entry: [{ changes: [{ value: {
          messages: [{ from: '+573001234567', id: 'wamid_in_001', type: 'text', text: { body: 'Hola!' } }],
        }}]}],
      };

      const result = await service.handleWhatsappWebhook(payload);

      expect(mockPrismaMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ direction: MessageDirection.inbound, wamid: 'wamid_in_001' }),
        }),
      );
      expect(mockWhatsappApi.markAsRead).toHaveBeenCalledWith('wamid_in_001');
      expect(mockGateway.emitNewMessage).toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });
  });

  // ── handleWhatsappWebhook — status update ─────────────────────────────────
  describe('handleWhatsappWebhook — status update', () => {
    it('should update message status to delivered and emit status event', async () => {
      const updatedMsg = { ...mockMessage, status: MessageStatus.delivered };
      mockPrismaMessage.findUnique.mockResolvedValue(mockMessage);
      mockPrismaMessage.update.mockResolvedValue(updatedMsg);

      const payload = {
        entry: [{ changes: [{ value: {
          statuses: [{ id: 'wamid_abc123', status: 'delivered' }],
        }}]}],
      };

      const result = await service.handleWhatsappWebhook(payload);

      expect(mockPrismaMessage.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { wamid: 'wamid_abc123' }, data: { status: MessageStatus.delivered } }),
      );
      expect(mockGateway.emitMessageStatusUpdate).toHaveBeenCalledWith(
        mockMessage.contactId,
        expect.objectContaining({ wamid: 'wamid_abc123', status: MessageStatus.delivered }),
      );
      expect(result).toEqual({ received: true });
    });

    it('should always return received:true even on errors', async () => {
      mockPrismaMessage.findUnique.mockRejectedValue(new Error('DB error'));
      const result = await service.handleWhatsappWebhook({ entry: [{ changes: [{ value: { statuses: [{ id: 'x', status: 'read' }] }}]}] });
      expect(result).toEqual({ received: true });
    });
  });
});
