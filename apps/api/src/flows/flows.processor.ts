import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessagesService } from 'src/messages/messages.service';
import { FlowStepType } from './flows.dto';
import { FlowExecutionStatus, ContactStatus } from '@prisma/client';

export const FLOWS_QUEUE = 'flows';

export interface FlowStepJob {
  executionId: string;
  flowId: string;
  contactId: string;
  stepIndex: number;
  steps: Array<{ type: FlowStepType; config?: Record<string, any> }>;
}

@Processor(FLOWS_QUEUE)
export class FlowsProcessor {
  private readonly logger = new Logger(FlowsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
  ) {}

  @Process('execute_step')
  async handleStep(job: Job<FlowStepJob>) {
    const { executionId, contactId, stepIndex, steps } = job.data;
    const step = steps[stepIndex];

    if (!step) {
      await this.prisma.flowExecution.update({
        where: { id: executionId },
        data: { status: FlowExecutionStatus.completed, finishedAt: new Date() },
      });
      return;
    }

    try {
      await this.executeStep(step, contactId);
    } catch (err) {
      this.logger.error(`Flow execution ${executionId} step ${stepIndex} failed`, err);
      await this.prisma.flowExecution.update({
        where: { id: executionId },
        data: { status: FlowExecutionStatus.failed, finishedAt: new Date() },
      });
      return;
    }

    // If there are more steps, schedule the next one (with optional delay from current step config)
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      const delay = step.config?.delayMs ?? 0;
      await job.queue.add(
        'execute_step',
        { ...job.data, stepIndex: nextIndex },
        { delay, jobId: `${executionId}:step:${nextIndex}` },
      );
    } else {
      await this.prisma.flowExecution.update({
        where: { id: executionId },
        data: { status: FlowExecutionStatus.completed, finishedAt: new Date() },
      });
    }
  }

  private async executeStep(
    step: { type: FlowStepType; config?: Record<string, any> },
    contactId: string,
  ) {
    switch (step.type) {
      case FlowStepType.send_whatsapp:
        await this.messagesService.sendWhatsapp({
          contactId,
          content: step.config?.content ?? '',
          templateId: step.config?.templateId,
        });
        break;

      case FlowStepType.send_email:
        await this.messagesService.sendEmail({
          contactId,
          subject: step.config?.subject ?? '',
          content: step.config?.content ?? '',
          templateId: step.config?.templateId,
        });
        break;

      case FlowStepType.update_status:
        await this.prisma.contact.update({
          where: { id: contactId },
          data: { status: step.config?.status as ContactStatus },
        });
        break;

      case FlowStepType.assign_tag:
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

      case FlowStepType.wait:
        // The delay is handled by BullMQ's job delay — nothing to execute here
        break;

      default:
        this.logger.warn(`Unknown step type: ${(step as any).type}`);
    }
  }
}
