"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const tasks_service_1 = require("./tasks.service");
const tasks_processor_1 = require("./tasks.processor");
const client_1 = require("@prisma/client");
const mockPrismaTask = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
};
const mockPrismaService = { task: mockPrismaTask };
const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    removeJobs: jest.fn().mockResolvedValue(undefined),
};
const mockTask = {
    id: 'task-1',
    title: 'Llamar cliente',
    description: 'Seguimiento propuesta',
    status: client_1.TaskStatus.pending,
    contactId: 'contact-1',
    assignedToId: 'user-1',
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    contact: { id: 'contact-1', name: 'Juan' },
    assignedTo: { id: 'user-1', name: 'Agente' },
};
describe('TasksService', () => {
    let service;
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tasks_service_1.TasksService,
                { provide: 'PrismaService', useValue: mockPrismaService },
                { provide: (0, bull_1.getQueueToken)(tasks_processor_1.TASKS_QUEUE), useValue: mockQueue },
            ],
        }).compile();
        service = module.get(tasks_service_1.TasksService);
        service.prisma = mockPrismaService;
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findAll', () => {
        it('should return all tasks', async () => {
            mockPrismaTask.findMany.mockResolvedValue([mockTask]);
            const result = await service.findAll();
            expect(mockPrismaTask.findMany).toHaveBeenCalled();
            expect(result).toEqual([mockTask]);
        });
        it('should filter by status when provided', async () => {
            mockPrismaTask.findMany.mockResolvedValue([mockTask]);
            await service.findAll('pending');
            expect(mockPrismaTask.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ status: 'pending' }),
            }));
        });
        it('should filter by contactId when provided', async () => {
            mockPrismaTask.findMany.mockResolvedValue([mockTask]);
            await service.findAll(undefined, 'contact-1');
            expect(mockPrismaTask.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ contactId: 'contact-1' }),
            }));
        });
    });
    describe('create', () => {
        const createDto = {
            title: 'Llamar cliente',
            contactId: 'contact-1',
            assignedToId: 'user-1',
        };
        it('should create a task without scheduling a reminder when no dueDate', async () => {
            mockPrismaTask.create.mockResolvedValue({ ...mockTask, dueDate: null });
            const result = await service.create(createDto);
            expect(mockPrismaTask.create).toHaveBeenCalled();
            expect(mockQueue.add).not.toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({ title: 'Llamar cliente' }));
        });
        it('should schedule a BullMQ reminder when dueDate is in the future', async () => {
            const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            const taskWithDate = { ...mockTask, dueDate: new Date(futureDate) };
            mockPrismaTask.create.mockResolvedValue(taskWithDate);
            await service.create({ ...createDto, dueDate: futureDate });
            expect(mockQueue.add).toHaveBeenCalledWith('reminder', expect.objectContaining({ taskId: 'task-1' }), expect.objectContaining({ jobId: 'reminder:task-1' }));
        });
        it('should NOT schedule a reminder when dueDate is in the past', async () => {
            const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const taskWithPastDate = { ...mockTask, dueDate: new Date(pastDate) };
            mockPrismaTask.create.mockResolvedValue(taskWithPastDate);
            await service.create({ ...createDto, dueDate: pastDate });
            expect(mockQueue.add).not.toHaveBeenCalled();
        });
    });
    describe('update', () => {
        it('should update a task and return it', async () => {
            const updated = { ...mockTask, status: client_1.TaskStatus.done };
            mockPrismaTask.findUnique.mockResolvedValue(mockTask);
            mockPrismaTask.update.mockResolvedValue(updated);
            const result = await service.update('task-1', { status: client_1.TaskStatus.done });
            expect(mockPrismaTask.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'task-1' } }));
            expect(result.status).toBe(client_1.TaskStatus.done);
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
            await expect(service.update('nonexistent', { title: 'x' })).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=tasks.service.spec%20(1).js.map