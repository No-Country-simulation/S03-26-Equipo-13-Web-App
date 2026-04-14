import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { MessagesService } from './messages.service';
import { SendWhatsappDto, SendEmailByContactDto } from './messages.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { SettingsService } from 'src/settings/settings.service';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly config: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Historial unificado de mensajes de un contacto',
    description: 'Devuelve todos los mensajes (WhatsApp + Email) de un contacto ordenados por fecha ascendente.',
  })
  @ApiQuery({ name: 'contactId', required: true, description: 'ID del contacto' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes del contacto' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  findByContact(@Query('contactId') contactId: string) {
    return this.messagesService.findByContact(contactId);
  }

  @Post('whatsapp')
  @ApiOperation({
    summary: 'Enviar mensaje de WhatsApp',
    description:
      'Envía un mensaje de WhatsApp usando texto libre o una plantilla aprobada por Meta. ' +
      'Si se usa plantilla, `templateName` es requerido. ' +
      'Las variables de la plantilla ({{1}}, {{2}}...) se pasan en `templateVariables`.',
  })
  @ApiBody({ type: SendWhatsappDto })
  @ApiResponse({ status: 201, description: 'Mensaje enviado y guardado en BD con wamid de Meta' })
  @ApiResponse({ status: 400, description: 'Falta content o templateName' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  @ApiResponse({ status: 502, description: 'Error de Meta Cloud API' })
  sendWhatsapp(@Body() dto: SendWhatsappDto) {
    return this.messagesService.sendWhatsapp(dto);
  }

  @Post('email')
  @ApiOperation({
    summary: 'Enviar email vía Brevo SMTP',
    description: 'Envía un email al contacto usando Brevo. Requiere BREVO_API_KEY en .env.',
  })
  @ApiBody({ type: SendEmailByContactDto })
  @ApiResponse({ status: 201, description: 'Email enviado y guardado en BD' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  sendEmail(@Body() dto: SendEmailByContactDto) {
    return this.messagesService.sendEmail(dto);
  }

  @Public()
  @Get('webhook/whatsapp')
  @ApiOperation({
    summary: 'Verificación del webhook de Meta (GET)',
    description:
      'Meta llama a este endpoint cuando configuras el webhook en el portal de desarrolladores. ' +
      'Responde con el challenge para verificar la URL. ' +
      'Requiere que WEBHOOK_VERIFY_TOKEN en .env coincida con el token configurado en Meta.',
  })
  @ApiQuery({ name: 'hub.mode', required: true, example: 'subscribe' })
  @ApiQuery({ name: 'hub.verify_token', required: true, example: 'mi-token-secreto-2026' })
  @ApiQuery({ name: 'hub.challenge', required: true, example: '1234567890' })
  @ApiResponse({ status: 200, description: 'Challenge devuelto — webhook verificado' })
  @ApiResponse({ status: 400, description: 'Token incorrecto — verificación fallida' })
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken =
      (await this.settingsService.get('WEBHOOK_VERIFY_TOKEN')) ??
      this.config.get<string>('WEBHOOK_VERIFY_TOKEN') ??
      '';
    const result = this.messagesService.verifyWebhook(mode, token, challenge, verifyToken);
    res.status(200).send(result);
  }

  @Public()
  @Post('webhook/whatsapp')
  @ApiOperation({
    summary: 'Webhook de Meta (POST) — mensajes entrantes y actualizaciones de estado',
    description:
      'Meta llama a este endpoint cuando:\n' +
      '- Un usuario envía un mensaje de WhatsApp al negocio\n' +
      '- El estado de un mensaje cambia (sent → delivered → read → failed)\n\n' +
      'Este endpoint siempre responde 200 para evitar reintentos de Meta. ' +
      'Los mensajes entrantes se guardan en BD y se emiten por Socket.io. ' +
      'Las actualizaciones de estado actualizan el campo `status` del mensaje por `wamid`.',
  })
  @ApiResponse({ status: 200, description: 'Recibido correctamente' })
  handleWhatsappWebhook(@Body() payload: any) {
    return this.messagesService.handleWhatsappWebhook(payload);
  }
}
