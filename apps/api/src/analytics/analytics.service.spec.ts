import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { AnalyticsService, EXPORT_QUEUE } from './analytics.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageDirection } from '@prisma/client';

const mockPrismaContact = { count: jest.fn() };
const mockPrismaMessage = { count: jest.fn(), findMany: jest.fn() };
const mockTransaction = jest.fn();
const mockPrismaService = {
  contact: mockPrismaContact,
  message: mockPrismaMessage,
  $transaction: mockTransaction,
};
const mockQueue = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) };

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getQueueToken(EXPORT_QUEUE), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    (service as any).prisma = mockPrismaService;
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('getSummary', () => {
    it('should return KPIs with response rate', async () => {
      mockTransaction.mockResolvedValue([100, 40, 200, 80, 120]);
      const result = await service.getSummary();
      expect(result).toEqual({
        totalContacts: 100, activeContacts: 40, totalMessages: 200,
        inboundMessages: 80, outboundMessages: 120, responseRate: '67%',
      });
    });

    it('should return 0% response rate when there are no outbound messages', async () => {
      mockTransaction.mockResolvedValue([10, 5, 0, 0, 0]);
      const result = await service.getSummary();
      expect(result.responseRate).toBe('0%');
    });
  });

  describe('getMessageStats', () => {
    it('should return messages grouped by day for 7d range', async () => {
      const today = new Date();
      const messages = [
        { createdAt: today, direction: MessageDirection.inbound, channel: 'whatsapp' },
        { createdAt: today, direction: MessageDirection.outbound, channel: 'whatsapp' },
      ];
      mockPrismaMessage.findMany.mockResolvedValue(messages);
      const result = await service.getMessageStats('7d');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('inbound', 1);
      expect(result[0]).toHaveProperty('outbound', 1);
    });

    it('should query 30 days when range is 30d', async () => {
      mockPrismaMessage.findMany.mockResolvedValue([]);
      await service.getMessageStats('30d');
      const call = mockPrismaMessage.findMany.mock.calls[0][0];
      const since: Date = call.where.createdAt.gte;
      const diffDays = Math.round((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(29);
    });
  });

  describe('queueContactsExport', () => {
    it('should add an export job to the queue and return jobId', async () => {
      const result = await service.queueContactsExport();
      expect(mockQueue.add).toHaveBeenCalledWith(
        'export_contacts_csv',
        expect.objectContaining({ requestedAt: expect.any(String) }),
        expect.any(Object),
      );
      expect(result).toHaveProperty('jobId', 'job-1');
      expect(result).toHaveProperty('message');
    });
  });
});
