"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const tasks_processor_1 = require("./tasks.processor");
let TasksService = class TasksService {
    prisma;
    tasksQueue;
    constructor(prisma, tasksQueue) {
        this.prisma = prisma;
        this.tasksQueue = tasksQueue;
    }
    async findAll(status, contactId) {
        return this.prisma.task.findMany({
            where: {
                ...(status && { status: status }),
                ...(contactId && { contactId }),
            },
            include: {
                contact: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async create(dto) {
        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                contactId: dto.contactId,
                assignedToId: dto.assignedToId,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            },
            include: {
                contact: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
        if (task.dueDate) {
            const delay = task.dueDate.getTime() - Date.now();
            if (delay > 0) {
                await this.tasksQueue.add('reminder', { taskId: task.id, title: task.title, assignedToId: task.assignedToId, contactId: task.contactId }, { delay, jobId: `reminder:${task.id}`, removeOnComplete: true });
            }
        }
        return task;
    }
    async update(id, dto) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task)
            throw new common_1.NotFoundException(`Tarea ${id} no encontrada`);
        const updated = await this.prisma.task.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
                ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
            },
            include: {
                contact: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
        if (dto.dueDate) {
            await this.tasksQueue.removeJobs(`reminder:${id}`);
            const delay = new Date(dto.dueDate).getTime() - Date.now();
            if (delay > 0) {
                await this.tasksQueue.add('reminder', { taskId: id, title: updated.title, assignedToId: updated.assignedToId, contactId: updated.contactId }, { delay, jobId: `reminder:${id}`, removeOnComplete: true });
            }
        }
        return updated;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)(tasks_processor_1.TASKS_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], TasksService);
//# sourceMappingURL=tasks.service.js.map