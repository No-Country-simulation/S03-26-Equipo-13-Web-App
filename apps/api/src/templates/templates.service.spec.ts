import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TemplateCategory } from './templates.dto';

const mockPrismaTemplate = {
  findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(),
};
const mockPrismaService = { template: mockPrismaTemplate };

const mockTemplate = {
  id: 'tpl-1', name: 'Bienvenida', content: 'Hola {{1}}, bienvenido!',
  category: TemplateCategory.marketing, createdAt: new Date(), updatedAt: new Date(),
};

describe('TemplatesService', () => {
  let service: TemplatesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    (service as any).prisma = mockPrismaService;
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('findAll', () => {
    it('should return all templates ordered by createdAt', async () => {
      mockPrismaTemplate.findMany.mockResolvedValue([mockTemplate]);
      const result = await service.findAll();
      expect(mockPrismaTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('create', () => {
    it('should create and return a template', async () => {
      // 1. Mock the global fetch response
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({ id: 'meta-tpl-123' }), // Success from Meta
      });

      mockPrismaTemplate.create.mockResolvedValue(mockTemplate);

      const dto = {
        name: 'Bienvenida',
        content: 'Hola {{1}}',
        category: TemplateCategory.marketing,
      };

      const result = await service.create(dto);

      // 2. Assert fetch was called with the right data
      expect(global.fetch).toHaveBeenCalled();

      // 3. Assert DB was updated
      expect(mockPrismaTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'bienvenida' }),
        }),
      );
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('handleMetaApproval', () => {
    const buildPayload = (name: string, event: string) => ({
      entry: [{ changes: [{ value: { message_template_name: name, event } }] }],
    });

    it('should update template category to approved', async () => {
      mockPrismaTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaTemplate.update.mockResolvedValue({ ...mockTemplate, category: 'approved' });
      const result = await service.handleMetaApproval(buildPayload('Bienvenida', 'APPROVED'));
      expect(mockPrismaTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'tpl-1' }, data: { category: 'approved' } }),
      );
      expect(result).toEqual({ received: true });
    });

    it('should return received:true when template is not found', async () => {
      mockPrismaTemplate.findFirst.mockResolvedValue(null);
      const result = await service.handleMetaApproval(buildPayload('Unknown', 'APPROVED'));
      expect(mockPrismaTemplate.update).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });

    it('should return received:true for malformed payloads', async () => {
      expect(await service.handleMetaApproval({})).toEqual({ received: true });
    });
  });
});
