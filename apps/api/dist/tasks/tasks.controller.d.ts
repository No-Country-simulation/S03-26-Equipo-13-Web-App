import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
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
