import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

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

  @Process('reminder')
  async handleReminder(job: Job<TaskReminderJob>) {
    const { taskId, title, assignedToId } = job.data;
    this.logger.log(`Reminder fired — task "${title}" (${taskId}) for user ${assignedToId ?? 'unassigned'}`);
  }
}
