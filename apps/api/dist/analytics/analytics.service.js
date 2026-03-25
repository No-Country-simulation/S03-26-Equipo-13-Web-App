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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = exports.EXPORT_QUEUE = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
exports.EXPORT_QUEUE = 'export';
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    prisma;
    exportQueue;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(prisma, exportQueue) {
        this.prisma = prisma;
        this.exportQueue = exportQueue;
    }
    async getSummary() {
        const [totalContacts, activeContacts, totalMessages, inboundMessages, outboundMessages] = await this.prisma.$transaction([
            this.prisma.contact.count(),
            this.prisma.contact.count({ where: { status: client_1.ContactStatus.active } }),
            this.prisma.message.count(),
            this.prisma.message.count({ where: { direction: client_1.MessageDirection.inbound } }),
            this.prisma.message.count({ where: { direction: client_1.MessageDirection.outbound } }),
        ]);
        const responseRate = outboundMessages > 0
            ? Math.round((inboundMessages / outboundMessages) * 100)
            : 0;
        return {
            totalContacts,
            activeContacts,
            totalMessages,
            inboundMessages,
            outboundMessages,
            responseRate: `${responseRate}%`,
        };
    }
    async getMessageStats(range = '7d') {
        const days = range === '30d' ? 30 : 7;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const messages = await this.prisma.message.findMany({
            where: { createdAt: { gte: since } },
            select: { createdAt: true, direction: true, channel: true },
            orderBy: { createdAt: 'asc' },
        });
        const grouped = {};
        for (const msg of messages) {
            const date = msg.createdAt.toISOString().split('T')[0];
            if (!grouped[date])
                grouped[date] = { date, inbound: 0, outbound: 0 };
            if (msg.direction === client_1.MessageDirection.inbound)
                grouped[date].inbound++;
            else
                grouped[date].outbound++;
        }
        return Object.values(grouped);
    }
    async queueContactsExport() {
        const job = await this.exportQueue.add('export_contacts_csv', { requestedAt: new Date().toISOString() }, { removeOnComplete: true });
        return { jobId: job.id, message: 'Export iniciado. Recibirás el archivo al completarse.' };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)(exports.EXPORT_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map