import { Job } from 'bull';
export declare const TASKS_QUEUE = "tasks";
export interface TaskReminderJob {
    taskId: string;
    title: string;
    assignedToId?: string;
    contactId: string;
}
export declare class TasksProcessor {
    private readonly logger;
    handleReminder(job: Job<TaskReminderJob>): Promise<void>;
}
