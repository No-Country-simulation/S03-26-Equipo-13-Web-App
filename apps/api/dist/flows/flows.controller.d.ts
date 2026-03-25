import { FlowsService } from './flows.service';
import { CreateFlowDto, UpdateFlowDto } from './flows.dto';
export declare class FlowsController {
    private readonly flowsService;
    constructor(flowsService: FlowsService);
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
}
