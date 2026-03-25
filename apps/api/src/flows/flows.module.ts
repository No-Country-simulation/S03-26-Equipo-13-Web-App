import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { FlowsProcessor, FLOWS_QUEUE } from './flows.processor';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [
    PrismaModule,
    MessagesModule,
    BullModule.registerQueue({ name: FLOWS_QUEUE }),
  ],
  controllers: [FlowsController],
  providers: [FlowsService, FlowsProcessor],
  exports: [FlowsService],
})
export class FlowsModule {}
