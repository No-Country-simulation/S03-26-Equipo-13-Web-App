import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { FlowsService } from './flows.service';
import { FLOWS_QUEUE } from './flows.processor';
import { PrismaService } from 'src/prisma/prisma.service';
import { FlowExecutionStatus } from '@prisma/client';
import { FlowTrigger } from './flows.dto';

const mockPrismaFlow = { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() };
const mockPrismaExecution = { create: jest.fn() };
const mockPrismaService = { flow: mockPrismaFlow, flowExecution: mockPrismaExecution };
const mockQueue = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) };

const mockFlow = {
  id: 'flow-1', name: 'Bienvenida', trigger: FlowTrigger.contact_created,
  steps: [{ type: 'send_whatsapp', config: { content: 'Hola!' } }],
  active: true, createdAt: new Date(), updatedAt: new Date(), executions: [],
};

describe('FlowsService', () => {
  let service: FlowsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlowsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getQueueToken(FLOWS_QUEUE), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<FlowsService>(FlowsService);
    (service as any).prisma = mockPrismaService;
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('findAll', () => {
    it('should return all flows with recent executions', async () => {
      mockPrismaFlow.findMany.mockResolvedValue([mockFlow]);
      const result = await service.findAll();
      expect(mockPrismaFlow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ include: expect.objectContaining({ executions: expect.any(Object) }) }),
      );
      expect(result).toEqual([mockFlow]);
    });
  });

  describe('create', () => {
    it('should create a flow and return it', async () => {
      mockPrismaFlow.create.mockResolvedValue(mockFlow);
      const dto = {
        name: 'Bienvenida', trigger: FlowTrigger.contact_created,
        steps: [{ type: 'send_whatsapp' as any, config: { content: 'Hola!' } }],
      };
      const result = await service.create(dto);
      expect(mockPrismaFlow.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'Bienvenida', active: true }) }),
      );
      expect(result).toEqual(mockFlow);
    });
  });

  describe('update', () => {
    it('should pause a flow by setting active to false', async () => {
      const paused = { ...mockFlow, active: false };
      mockPrismaFlow.findUnique.mockResolvedValue(mockFlow);
      mockPrismaFlow.update.mockResolvedValue(paused);
      const result = await service.update('flow-1', { active: false });
      expect(mockPrismaFlow.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'flow-1' }, data: expect.objectContaining({ active: false }) }),
      );
      expect(result.active).toBe(false);
    });

    it('should throw NotFoundException when flow does not exist', async () => {
      mockPrismaFlow.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', { active: false })).rejects.toThrow(NotFoundException);
    });
  });

  describe('triggerFlow', () => {
    it('should create an execution and queue the first step', async () => {
      const mockExecution = {
        id: 'exec-1', flowId: 'flow-1', contactId: 'contact-1',
        status: FlowExecutionStatus.running, startedAt: new Date(), finishedAt: null,
      };
      mockPrismaFlow.findUnique.mockResolvedValue(mockFlow);
      mockPrismaExecution.create.mockResolvedValue(mockExecution);
      const result = await service.triggerFlow('flow-1', 'contact-1');
      expect(mockPrismaExecution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ flowId: 'flow-1', contactId: 'contact-1', status: FlowExecutionStatus.running }),
        }),
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute_step',
        expect.objectContaining({ executionId: 'exec-1', stepIndex: 0 }),
        expect.any(Object),
      );
      expect(result).toEqual(mockExecution);
    });

    it('should return null when flow is inactive', async () => {
      mockPrismaFlow.findUnique.mockResolvedValue({ ...mockFlow, active: false });
      expect(await service.triggerFlow('flow-1', 'contact-1')).toBeNull();
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('should return null when flow does not exist', async () => {
      mockPrismaFlow.findUnique.mockResolvedValue(null);
      expect(await service.triggerFlow('nonexistent', 'contact-1')).toBeNull();
    });
  });
});
