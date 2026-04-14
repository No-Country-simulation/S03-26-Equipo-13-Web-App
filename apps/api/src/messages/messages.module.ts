import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { WhatsappApiService } from './whatsapp-api.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BrevoApiService } from './brevo-api.service';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [PrismaModule, ConfigModule, SettingsModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, WhatsappApiService, BrevoApiService],
  exports: [MessagesService, MessagesGateway, WhatsappApiService, BrevoApiService],
})
export class MessagesModule { }
