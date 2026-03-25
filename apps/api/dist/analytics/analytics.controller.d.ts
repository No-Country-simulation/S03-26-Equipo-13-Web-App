import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
    exportContacts(): Promise<{
        jobId: import("bull").JobId;
        message: string;
    }>;
}
