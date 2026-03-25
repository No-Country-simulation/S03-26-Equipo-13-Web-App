import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { WhatsappApiService } from './whatsapp-api.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, WhatsappApiService],
  exports: [MessagesService, MessagesGateway, WhatsappApiService],
})
export class MessagesModule {}
