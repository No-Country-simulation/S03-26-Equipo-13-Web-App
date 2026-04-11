import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { EmailService } from './email.service.js';
import { SendEmailDto } from './dto/send-email.dto.js';

@ApiTags('email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar un email transaccional vía Brevo' })
  async send(@Body() dto: SendEmailDto): Promise<{ ok: boolean; data: unknown }> {
    return this.emailService.send(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Historial de emails enviados' })
  @ApiQuery({
    name: 'contactId',
    required: false,
    description: 'Filtrar por ID de contacto',
  })
  async getHistory(@Query('contactId') contactId?: string): Promise<unknown[]> {
    return this.emailService.getHistory(contactId);
  }
}
