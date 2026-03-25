import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessagesService } from 'src/messages/messages.service';
import { FlowStepType } from './flows.dto';
export declare const FLOWS_QUEUE = "flows";
export interface FlowStepJob {
    executionId: string;
    flowId: string;
    contactId: string;
    stepIndex: number;
    steps: Array<{
        type: FlowStepType;
        config?: Record<string, any>;
    }>;
}
export declare class FlowsProcessor {
    private readonly prisma;
    private readonly messagesService;
    private readonly logger;
    constructor(prisma: PrismaService, messagesService: MessagesService);
    handleStep(job: Job<FlowStepJob>): Promise<void>;
    private executeStep;
}
