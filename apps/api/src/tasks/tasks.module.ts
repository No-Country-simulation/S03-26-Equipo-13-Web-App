import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksProcessor, TASKS_QUEUE } from './tasks.processor';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: TASKS_QUEUE }),
    MessagesModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksProcessor],
})
export class TasksModule {}
