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
var FlowsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowsProcessor = exports.FLOWS_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const messages_service_1 = require("../messages/messages.service");
const flows_dto_1 = require("./flows.dto");
const client_1 = require("@prisma/client");
exports.FLOWS_QUEUE = 'flows';
let FlowsProcessor = FlowsProcessor_1 = class FlowsProcessor {
    prisma;
    messagesService;
    logger = new common_1.Logger(FlowsProcessor_1.name);
    constructor(prisma, messagesService) {
        this.prisma = prisma;
        this.messagesService = messagesService;
    }
    async handleStep(job) {
        const { executionId, contactId, stepIndex, steps } = job.data;
        const step = steps[stepIndex];
        if (!step) {
            await this.prisma.flowExecution.update({
                where: { id: executionId },
                data: { status: client_1.FlowExecutionStatus.completed, finishedAt: new Date() },
            });
            return;
        }
        try {
            await this.executeStep(step, contactId);
        }
        catch (err) {
            this.logger.error(`Flow execution ${executionId} step ${stepIndex} failed`, err);
            await this.prisma.flowExecution.update({
                where: { id: executionId },
                data: { status: client_1.FlowExecutionStatus.failed, finishedAt: new Date() },
            });
            return;
        }
        const nextIndex = stepIndex + 1;
        if (nextIndex < steps.length) {
            const delay = step.config?.delayMs ?? 0;
            await job.queue.add('execute_step', { ...job.data, stepIndex: nextIndex }, { delay, jobId: `${executionId}:step:${nextIndex}` });
        }
        else {
            await this.prisma.flowExecution.update({
                where: { id: executionId },
                data: { status: client_1.FlowExecutionStatus.completed, finishedAt: new Date() },
            });
        }
    }
    async executeStep(step, contactId) {
        switch (step.type) {
            case flows_dto_1.FlowStepType.send_whatsapp:
                await this.messagesService.sendWhatsapp({
                    contactId,
                    content: step.config?.content ?? '',
                    templateId: step.config?.templateId,
                });
                break;
            case flows_dto_1.FlowStepType.send_email:
                await this.messagesService.sendEmail({
                    contactId,
                    subject: step.config?.subject ?? '',
                    content: step.config?.content ?? '',
                    templateId: step.config?.templateId,
                });
                break;
            case flows_dto_1.FlowStepType.update_status:
                await this.prisma.contact.update({
                    where: { id: contactId },
                    data: { status: step.config?.status },
                });
                break;
            case flows_dto_1.FlowStepType.assign_tag:
                if (step.config?.tagName) {
                    const tag = await this.prisma.tag.upsert({
                        where: { name: step.config.tagName },
                        update: {},
                        create: { name: step.config.tagName },
                    });
                    await this.prisma.contact.update({
                        where: { id: contactId },
                        data: { tags: { connect: { id: tag.id } } },
                    });
                }
                break;
            case flows_dto_1.FlowStepType.wait:
                break;
            default:
                this.logger.warn(`Unknown step type: ${step.type}`);
        }
    }
};
exports.FlowsProcessor = FlowsProcessor;
__decorate([
    (0, bull_1.Process)('execute_step'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FlowsProcessor.prototype, "handleStep", null);
exports.FlowsProcessor = FlowsProcessor = FlowsProcessor_1 = __decorate([
    (0, bull_1.Processor)(exports.FLOWS_QUEUE),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messages_service_1.MessagesService])
], FlowsProcessor);
//# sourceMappingURL=flows.processor.js.map