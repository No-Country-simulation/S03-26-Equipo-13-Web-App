import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService, EXPORT_QUEUE } from './analytics.service';
import { ExportProcessor } from './export.processor';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: EXPORT_QUEUE }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ExportProcessor],
})
export class AnalyticsModule {}
