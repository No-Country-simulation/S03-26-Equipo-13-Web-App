import { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
export declare const EXPORT_QUEUE = "export";
export declare class AnalyticsService {
    private readonly prisma;
    private readonly exportQueue;
    private readonly logger;
    constructor(prisma: PrismaService, exportQueue: Queue);
    getSummary(): Promise<{
        totalContacts: number;
        activeContacts: number;
        totalMessages: number;
        inboundMessages: number;
        outboundMessages: number;
        responseRate: string;
    }>;
    getMessageStats(range?: '7d' | '30d'): Promise<{
        date: string;
        inbound: number;
        outbound: number;
    }[]>;
    queueContactsExport(): Promise<{
        jobId: import("bull").JobId;
        message: string;
    }>;
}
