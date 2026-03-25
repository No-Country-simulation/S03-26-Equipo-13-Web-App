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
    const [totalContacts, activeContacts, totalMessages, inboundMessages, outboundMessages] =
      await this.prisma.$transaction([
        this.prisma.contact.count(),
        this.prisma.contact.count({ where: { status: ContactStatus.active } }),
        this.prisma.message.count(),
        this.prisma.message.count({ where: { direction: MessageDirection.inbound } }),
        this.prisma.message.count({ where: { direction: MessageDirection.outbound } }),
      ]);

    const responseRate =
      outboundMessages > 0
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

  async getMessageStats(range: '7d' | '30d' = '7d') {
    const days = range === '30d' ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const messages = await this.prisma.message.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, direction: true, channel: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, { date: string; inbound: number; outbound: number }> = {};

    for (const msg of messages) {
      const date = msg.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = { date, inbound: 0, outbound: 0 };
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
