import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactStatus, MessageDirection } from '@prisma/client';

export const EXPORT_QUEUE = 'export';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(EXPORT_QUEUE) private readonly exportQueue: Queue,
  ) {}

  async getSummary() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const [
      totalContacts,
      activeContacts,
      totalMessages,
      inboundMessages,
      outboundMessages,
      messagesThisWeek,
      pendingTasks,
      newContactsThisWeek,
      countNew,
      countInactive,
      countArchived,
    ] = await this.prisma.$transaction([
      this.prisma.contact.count(),
      this.prisma.contact.count({ where: { status: ContactStatus.active } }),
      this.prisma.message.count(),
      this.prisma.message.count({ where: { direction: MessageDirection.inbound } }),
      this.prisma.message.count({ where: { direction: MessageDirection.outbound } }),
      this.prisma.message.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.task.count({ where: { status: 'pending' } }),
      this.prisma.contact.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.contact.count({ where: { status: ContactStatus.new } }),
      this.prisma.contact.count({ where: { status: ContactStatus.inactive } }),
      this.prisma.contact.count({ where: { status: ContactStatus.archived } }),
    ]);

    const responseRate =
      outboundMessages > 0
        ? Math.round((inboundMessages / outboundMessages) * 100)
        : 0;

    const funnel: Record<string, number> = {
      new: countNew,
      active: activeContacts,
      inactive: countInactive,
      archived: countArchived,
    };

    return {
      totalContacts,
      activeContacts,
      totalMessages,
      messagesThisWeek,
      inboundMessages,
      outboundMessages,
      responseRate: `${responseRate}%`,
      pendingTasks,
      newContactsThisWeek,
      funnel,
    };
  }

  async getMessageStats(range: '7d' | '30d' = '7d') {
    const days = range === '30d' ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const messages = await this.prisma.message.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, direction: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build a map with all days in range initialised to 0
    const grouped: Record<string, { date: string; inbound: number; outbound: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      grouped[key] = { date: key, inbound: 0, outbound: 0 };
    }

    for (const msg of messages) {
      const date = msg.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) continue;
      if (msg.direction === MessageDirection.inbound) grouped[date].inbound++;
      else grouped[date].outbound++;
    }

    return Object.values(grouped);
  }

  async queueContactsExport() {
    const job = await this.exportQueue.add(
      'export_contacts_csv',
      { requestedAt: new Date().toISOString() },
      { removeOnComplete: true },
    );
    return { jobId: job.id, message: 'Export iniciado. Recibirás el archivo al completarse.' };
  }
}
