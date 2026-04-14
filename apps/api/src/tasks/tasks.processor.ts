import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { MessagesGateway } from 'src/messages/messages.gateway';

export const TASKS_QUEUE = 'tasks';

export interface TaskReminderJob {
  taskId: string;
  title: string;
  assignedToId?: string;
  contactId: string;
}

@Processor(TASKS_QUEUE)
export class TasksProcessor {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(private readonly gateway: MessagesGateway) {}

  @Process('reminder')
  async handleReminder(job: Job<TaskReminderJob>) {
    const { taskId, title, assignedToId, contactId } = job.data;

    this.logger.log(
      `Reminder fired — task "${title}" (${taskId}) for user ${assignedToId ?? 'unassigned'}`,
    );

    // Emit real-time notification via Socket.io so the frontend shows a toast
    this.gateway.emitTaskReminder(contactId, { taskId, title, assignedToId });
  }
}
