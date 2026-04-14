import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplateCategory } from './templates.dto';

const mockTemplate = {
  id: 'tpl-1',
  name: 'Bienvenida',
  content: 'Hola {{1}}',
  category: TemplateCategory.marketing,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTemplatesService = {
  findAll: jest.fn(),
  create: jest.fn(),
  handleMetaApproval: jest.fn(),
};

describe('TemplatesController', () => {
  let controller: TemplatesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [{ provide: TemplatesService, useValue: mockTemplatesService }],
    }).compile();

    controller = module.get<TemplatesController>(TemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all templates', async () => {
      mockTemplatesService.findAll.mockResolvedValue([mockTemplate]);

      const result = await controller.findAll();

      expect(mockTemplatesService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('create', () => {
    it('should create and return a template', async () => {
      const dto = { name: 'Bienvenida', content: 'Hola {{1}}', category: TemplateCategory.marketing };
      mockTemplatesService.create.mockResolvedValue(mockTemplate);

      const result = await controller.create(dto);

      expect(mockTemplatesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('handleMetaApproval', () => {
    it('should call handleMetaApproval and return received:true', async () => {
      mockTemplatesService.handleMetaApproval.mockResolvedValue({ received: true });

      const result = await controller.handleMetaApproval({ entry: [] });

      expect(mockTemplatesService.handleMetaApproval).toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });
  });
});
