import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service.js';
import { EmailController } from './email.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
