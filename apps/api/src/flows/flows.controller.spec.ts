import { Test, TestingModule } from '@nestjs/testing';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { FlowTrigger } from './flows.dto';

const mockFlow = {
  id: 'flow-1',
  name: 'Bienvenida',
  trigger: FlowTrigger.contact_created,
  steps: [],
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  executions: [],
};

const mockFlowsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('FlowsController', () => {
  let controller: FlowsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlowsController],
      providers: [{ provide: FlowsService, useValue: mockFlowsService }],
    }).compile();

    controller = module.get<FlowsController>(FlowsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all flows', async () => {
      mockFlowsService.findAll.mockResolvedValue([mockFlow]);

      const result = await controller.findAll();

      expect(mockFlowsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockFlow]);
    });
  });

  describe('create', () => {
    it('should create and return a flow', async () => {
      const dto = { name: 'Bienvenida', trigger: FlowTrigger.contact_created, steps: [] };
      mockFlowsService.create.mockResolvedValue(mockFlow);

      const result = await controller.create(dto as any);

      expect(mockFlowsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockFlow);
    });
  });

  describe('update', () => {
    it('should pause a flow', async () => {
      const paused = { ...mockFlow, active: false };
      mockFlowsService.update.mockResolvedValue(paused);

      const result = await controller.update('flow-1', { active: false });

      expect(mockFlowsService.update).toHaveBeenCalledWith('flow-1', { active: false });
      expect(result.active).toBe(false);
    });
  });
});
