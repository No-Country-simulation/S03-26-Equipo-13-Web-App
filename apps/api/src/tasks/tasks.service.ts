import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { TASKS_QUEUE } from './tasks.processor';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(TASKS_QUEUE) private readonly tasksQueue: Queue,
  ) {}

  async findAll(status?: string, contactId?: string) {
    return this.prisma.task.findMany({
      where: {
        ...(status && { status: status as TaskStatus }),
        ...(contactId && { contactId }),
      },
      include: {
        contact: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async create(dto: CreateTaskDto) {
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
        await this.tasksQueue.add(
          'reminder',
          { taskId: task.id, title: task.title, assignedToId: task.assignedToId, contactId: task.contactId },
          { delay, jobId: `reminder:${task.id}`, removeOnComplete: true },
        );
      }
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Tarea ${id} no encontrada`);

    // Map each field explicitly — avoids spreading dueDate as a raw string into Prisma
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

    // Reschedule BullMQ reminder if dueDate changed
    if (dto.dueDate) {
      await this.tasksQueue.removeJobs(`reminder:${id}`);
      const delay = new Date(dto.dueDate).getTime() - Date.now();
      if (delay > 0) {
        await this.tasksQueue.add(
          'reminder',
          { taskId: id, title: updated.title, assignedToId: updated.assignedToId, contactId: updated.contactId },
          { delay, jobId: `reminder:${id}`, removeOnComplete: true },
        );
      }
    }

    return updated;
  }
}
