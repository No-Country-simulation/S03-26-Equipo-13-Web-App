import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageDirection, MessageChannel, MessageStatus } from '@prisma/client';

const mockMessage = {
  id: 'msg-1', content: 'Hola!',
  direction: MessageDirection.outbound, channel: MessageChannel.whatsapp,
  status: MessageStatus.sent, contactId: 'contact-1', wamid: 'wamid_abc123',
  createdAt: new Date(),
};

const mockMessagesService = {
  findByContact: jest.fn(),
  sendWhatsapp: jest.fn(),
  sendEmail: jest.fn(),
  verifyWebhook: jest.fn(),
  handleWhatsappWebhook: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('startupcrm-webhook-2026'),
};

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  describe('findByContact', () => {
    it('should return messages for a contact', async () => {
      mockMessagesService.findByContact.mockResolvedValue([mockMessage]);
      const result = await controller.findByContact('contact-1');
      expect(mockMessagesService.findByContact).toHaveBeenCalledWith('contact-1');
      expect(result).toEqual([mockMessage]);
    });
  });

  describe('sendWhatsapp', () => {
    it('should send a whatsapp message and return it', async () => {
      const dto = { contactId: 'contact-1', content: 'Hola!' };
      mockMessagesService.sendWhatsapp.mockResolvedValue(mockMessage);
      const result = await controller.sendWhatsapp(dto as any);
      expect(mockMessagesService.sendWhatsapp).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('sendEmail', () => {
    it('should send an email and return the message', async () => {
      const dto = { contactId: 'contact-1', subject: 'Hola', content: 'Texto' };
      const emailMsg = { ...mockMessage, channel: MessageChannel.email };
      mockMessagesService.sendEmail.mockResolvedValue(emailMsg);
      const result = await controller.sendEmail(dto as any);
      expect(mockMessagesService.sendEmail).toHaveBeenCalledWith(dto);
      expect(result).toEqual(emailMsg);
    });
  });

  describe('handleWhatsappWebhook', () => {
    it('should call handleWhatsappWebhook and return received:true', async () => {
      mockMessagesService.handleWhatsappWebhook.mockResolvedValue({ received: true });
      const result = await controller.handleWhatsappWebhook({ entry: [] });
      expect(mockMessagesService.handleWhatsappWebhook).toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });
  });
});
