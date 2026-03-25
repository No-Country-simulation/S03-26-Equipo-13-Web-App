import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

const mockAnalyticsService = {
  getSummary: jest.fn(),
  getMessageStats: jest.fn(),
  queueContactsExport: jest.fn(),
};

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockAnalyticsService }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return KPIs from analyticsService', async () => {
      const summary = {
        totalContacts: 100,
        activeContacts: 40,
        totalMessages: 200,
        inboundMessages: 80,
        outboundMessages: 120,
        responseRate: '67%',
      };
      mockAnalyticsService.getSummary.mockResolvedValue(summary);

      const result = await controller.getSummary();

      expect(mockAnalyticsService.getSummary).toHaveBeenCalled();
      expect(result).toEqual(summary);
    });
  });

  describe('getMessageStats', () => {
    it('should default to 7d range when not provided', async () => {
      mockAnalyticsService.getMessageStats.mockResolvedValue([]);

      await controller.getMessageStats(undefined);

      expect(mockAnalyticsService.getMessageStats).toHaveBeenCalledWith('7d');
    });

    it('should pass 30d range when provided', async () => {
      mockAnalyticsService.getMessageStats.mockResolvedValue([]);

      await controller.getMessageStats('30d');

      expect(mockAnalyticsService.getMessageStats).toHaveBeenCalledWith('30d');
    });
  });

  describe('exportContacts', () => {
    it('should queue export and return jobId', async () => {
      const response = { jobId: 'job-1', message: 'Export iniciado.' };
      mockAnalyticsService.queueContactsExport.mockResolvedValue(response);

      const result = await controller.exportContacts();

      expect(mockAnalyticsService.queueContactsExport).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });
});
