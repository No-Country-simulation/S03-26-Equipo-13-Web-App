import { Module } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { EmailController } from './email.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SettingsModule } from '../settings/settings.module.js';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
