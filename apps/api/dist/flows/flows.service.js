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
exports.FlowsService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const flows_processor_1 = require("./flows.processor");
const client_1 = require("@prisma/client");
let FlowsService = class FlowsService {
    prisma;
    flowsQueue;
    constructor(prisma, flowsQueue) {
        this.prisma = prisma;
        this.flowsQueue = flowsQueue;
    }
    async findAll() {
        return this.prisma.flow.findMany({
            include: {
                executions: {
                    orderBy: { startedAt: 'desc' },
                    take: 5,
                    select: { id: true, status: true, startedAt: true, finishedAt: true, contactId: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(dto) {
        return this.prisma.flow.create({
            data: {
                name: dto.name,
                trigger: dto.trigger,
                steps: dto.steps,
                active: true,
            },
        });
    }
    async update(id, dto) {
        const flow = await this.prisma.flow.findUnique({ where: { id } });
        if (!flow)
            throw new common_1.NotFoundException(`Flujo ${id} no encontrado`);
        return this.prisma.flow.update({
            where: { id },
            data: {
                ...(dto.active !== undefined && { active: dto.active }),
                ...(dto.name && { name: dto.name }),
                ...(dto.steps && { steps: dto.steps }),
            },
        });
    }
    async triggerFlow(flowId, contactId) {
        const flow = await this.prisma.flow.findUnique({ where: { id: flowId } });
        if (!flow || !flow.active)
            return null;
        const execution = await this.prisma.flowExecution.create({
            data: {
                flowId,
                contactId,
                status: client_1.FlowExecutionStatus.running,
            },
        });
        await this.flowsQueue.add('execute_step', {
            executionId: execution.id,
            flowId,
            contactId,
            stepIndex: 0,
            steps: flow.steps,
        }, { jobId: `${execution.id}:step:0` });
        return execution;
    }
};
exports.FlowsService = FlowsService;
exports.FlowsService = FlowsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)(flows_processor_1.FLOWS_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], FlowsService);
//# sourceMappingURL=flows.service.js.map