import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
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
      this.logger.error(`Flow execution ${executionId} step ${stepIndex} failed: ${err.message}`);
      await this.prisma.flowExecution.update({
        where: { id: executionId },
        data: { status: FlowExecutionStatus.failed, finishedAt: new Date() },
      });
      return;
    }

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
      case FlowStepType.send_whatsapp: {
        // FIX: use templateName from config (not content)
        const templateName = step.config?.templateName;
        const content = step.config?.content;
        if (!templateName && !content) {
          this.logger.warn(`send_whatsapp step has no templateName or content — skipping`);
          return;
        }
        await this.messagesService.sendWhatsapp({
          contactId,
          ...(templateName ? { templateName } : { content }),
        });
        break;
      }

      case FlowStepType.send_email: {
        const subject = step.config?.subject ?? '(Sin asunto)';
        const content = step.config?.content ?? '';
        if (!content) {
          this.logger.warn(`send_email step has no content configured — skipping`);
          return;
        }
        await this.messagesService.sendEmail({ contactId, subject, content });
        break;
      }

      case FlowStepType.update_status:
        if (step.config?.status) {
          await this.prisma.contact.update({
            where: { id: contactId },
            data: { status: step.config.status as ContactStatus },
          });
        }
        break;

      case FlowStepType.assign_tag: {
        // FIX: UI stores the tag name as `tag` (not `tagName`)
        const tagName = step.config?.tagName ?? step.config?.tag;
        if (tagName) {
          const tag = await this.prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
          await this.prisma.contact.update({
            where: { id: contactId },
            data: { tags: { connect: { id: tag.id } } },
          });
        }
        break;
      }

      case FlowStepType.wait:
        // delay is handled by Bull queue via delayMs in config
        break;

      default:
        this.logger.warn(`Unknown step type: ${(step as any).type}`);
    }
  }
}
