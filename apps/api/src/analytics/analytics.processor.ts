import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { EXPORT_QUEUE } from './analytics.service';

@Processor(EXPORT_QUEUE)
export class AnalyticsProcessor {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('export_contacts_csv')
  async handleExportContacts(job: Job<{ requestedAt: string }>) {
    this.logger.log(`Processing contacts export (requested at ${job.data.requestedAt})`);

    const contacts = await this.prisma.contact.findMany({
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
    });

    const lines = [
      'id,name,email,phone,status,tags,createdAt',
      ...contacts.map((c) =>
        [
          c.id,
          `"${c.name.replace(/"/g, '""')}"`,
          c.email ?? '',
          c.phone,
          c.status,
          `"${c.tags.map((t) => t.name).join(';')}"`,
          c.createdAt.toISOString(),
        ].join(','),
      ),
    ].join('\n');

    this.logger.log(
      `Export completed: ${contacts.length} contacts — ${(lines.length / 1024).toFixed(1)} KB`,
    );

    // Store CSV in job result so callers can retrieve it if needed
    return { csv: lines, count: contacts.length };
  }
}
