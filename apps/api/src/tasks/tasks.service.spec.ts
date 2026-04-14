import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { TasksService } from './tasks.service';
import { TASKS_QUEUE } from './tasks.processor';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

const mockPrismaTask = { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() };
const mockPrismaService = { task: mockPrismaTask };
const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  removeJobs: jest.fn().mockResolvedValue(undefined),
};

const mockTask = {
  id: 'task-1', title: 'Llamar cliente', description: 'Seguimiento',
  status: TaskStatus.pending, contactId: 'contact-1', assignedToId: 'user-1',
  dueDate: null, createdAt: new Date(), updatedAt: new Date(),
  contact: { id: 'contact-1', name: 'Juan' }, assignedTo: { id: 'user-1', name: 'Agente' },
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getQueueToken(TASKS_QUEUE), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    (service as any).prisma = mockPrismaService;
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('findAll', () => {
    it('should return all tasks', async () => {
      mockPrismaTask.findMany.mockResolvedValue([mockTask]);
      expect(await service.findAll()).toEqual([mockTask]);
    });

    it('should filter by status when provided', async () => {
      mockPrismaTask.findMany.mockResolvedValue([mockTask]);
      await service.findAll('pending');
      expect(mockPrismaTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'pending' }) }),
      );
    });

    it('should filter by contactId when provided', async () => {
      mockPrismaTask.findMany.mockResolvedValue([mockTask]);
      await service.findAll(undefined, 'contact-1');
      expect(mockPrismaTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ contactId: 'contact-1' }) }),
      );
    });
  });

  describe('create', () => {
    const createDto = { title: 'Llamar cliente', contactId: 'contact-1', assignedToId: 'user-1' };

    it('should create a task without scheduling a reminder when no dueDate', async () => {
      mockPrismaTask.create.mockResolvedValue({ ...mockTask, dueDate: null });
      const result = await service.create(createDto);
      expect(mockPrismaTask.create).toHaveBeenCalled();
      expect(mockQueue.add).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ title: 'Llamar cliente' }));
    });

    it('should schedule a BullMQ reminder when dueDate is in the future', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      mockPrismaTask.create.mockResolvedValue({ ...mockTask, dueDate: new Date(futureDate) });
      await service.create({ ...createDto, dueDate: futureDate });
      expect(mockQueue.add).toHaveBeenCalledWith(
        'reminder',
        expect.objectContaining({ taskId: 'task-1' }),
        expect.objectContaining({ jobId: 'reminder:task-1' }),
      );
    });

    it('should NOT schedule a reminder when dueDate is in the past', async () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      mockPrismaTask.create.mockResolvedValue({ ...mockTask, dueDate: new Date(pastDate) });
      await service.create({ ...createDto, dueDate: pastDate });
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a task and return it', async () => {
      const updated = { ...mockTask, status: TaskStatus.done };
      mockPrismaTask.findUnique.mockResolvedValue(mockTask);
      mockPrismaTask.update.mockResolvedValue(updated);
      const result = await service.update('task-1', { status: TaskStatus.done });
      expect(mockPrismaTask.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'task-1' } }),
      );
      expect(result.status).toBe(TaskStatus.done);
    });

    it('should reschedule reminder when dueDate is updated', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      mockPrismaTask.findUnique.mockResolvedValue(mockTask);
      mockPrismaTask.update.mockResolvedValue({ ...mockTask, dueDate: new Date(futureDate) });
      await service.update('task-1', { dueDate: futureDate });
      expect(mockQueue.removeJobs).toHaveBeenCalledWith('reminder:task-1');
      expect(mockQueue.add).toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockPrismaTask.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', { title: 'x' })).rejects.toThrow(NotFoundException);
    });
  });
});
