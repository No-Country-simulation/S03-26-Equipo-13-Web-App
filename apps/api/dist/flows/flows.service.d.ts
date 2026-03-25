import { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFlowDto, UpdateFlowDto } from './flows.dto';
export declare class FlowsService {
    private readonly prisma;
    private readonly flowsQueue;
    constructor(prisma: PrismaService, flowsQueue: Queue);
    findAll(): Promise<({
        executions: {
            id: string;
            status: import(".prisma/client").$Enums.FlowExecutionStatus;
            contactId: string;
            startedAt: Date;
            finishedAt: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        steps: import("@prisma/client/runtime/library").JsonValue;
        trigger: string;
    })[]>;
    create(dto: CreateFlowDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        steps: import("@prisma/client/runtime/library").JsonValue;
        trigger: string;
    }>;
    update(id: string, dto: UpdateFlowDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        steps: import("@prisma/client/runtime/library").JsonValue;
        trigger: string;
    }>;
    triggerFlow(flowId: string, contactId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FlowExecutionStatus;
        contactId: string;
        flowId: string;
        startedAt: Date;
        finishedAt: Date | null;
    } | null>;
}
