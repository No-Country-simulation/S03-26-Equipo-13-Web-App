import { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
export declare class TasksService {
    private readonly prisma;
    private readonly tasksQueue;
    constructor(prisma: PrismaService, tasksQueue: Queue);
    findAll(status?: string, contactId?: string): Promise<({
        contact: {
            id: string;
            name: string;
        };
        assignedTo: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedToId: string | null;
        dueDate: Date | null;
        contactId: string;
    })[]>;
    create(dto: CreateTaskDto): Promise<{
        contact: {
            id: string;
            name: string;
        };
        assignedTo: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedToId: string | null;
        dueDate: Date | null;
        contactId: string;
    }>;
    update(id: string, dto: UpdateTaskDto): Promise<{
        contact: {
            id: string;
            name: string;
        };
        assignedTo: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedToId: string | null;
        dueDate: Date | null;
        contactId: string;
    }>;
}
