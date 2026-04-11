import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { TasksModule } from './tasks/tasks.module';
import { MessagesModule } from './messages/messages.module';
import { FlowsModule } from './flows/flows.module';
import { TemplatesModule } from './templates/templates.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // Config — makes process.env available via ConfigService everywhere
    ConfigModule.forRoot({ isGlobal: true }),

    // Redis connection shared by all BullMQ queues (tasks, flows, export, auth)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),

    // Global — PrismaService available everywhere without re-importing
    PrismaModule,

    // Feature modules
    AuthModule,
    ContactsModule,
    TasksModule,
    MessagesModule,
    FlowsModule,
    TemplatesModule,
    AnalyticsModule,
    EmailModule,
  ],
})
export class AppModule {}
