import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@prisma/client';

const mockTask = {
  id: 'task-1',
  title: 'Llamar cliente',
  status: TaskStatus.pending,
  contactId: 'contact-1',
  contact: { id: 'contact-1', name: 'Juan' },
  assignedTo: null,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTasksService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call tasksService.findAll with status and contactId', async () => {
      mockTasksService.findAll.mockResolvedValue([mockTask]);

      const result = await controller.findAll('pending', 'contact-1');

      expect(mockTasksService.findAll).toHaveBeenCalledWith('pending', 'contact-1');
      expect(result).toEqual([mockTask]);
    });
  });

  describe('create', () => {
    it('should call tasksService.create with the dto and return the task', async () => {
      const dto = { title: 'Llamar cliente', contactId: 'contact-1' };
      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(dto as any);

      expect(mockTasksService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should call tasksService.update with id and dto', async () => {
      const dto = { status: TaskStatus.done };
      const updated = { ...mockTask, status: TaskStatus.done };
      mockTasksService.update.mockResolvedValue(updated);

      const result = await controller.update('task-1', dto);

      expect(mockTasksService.update).toHaveBeenCalledWith('task-1', dto);
      expect(result.status).toBe(TaskStatus.done);
    });
  });
});
