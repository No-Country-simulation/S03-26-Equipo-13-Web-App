import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SettingsService, SettingKey, SETTINGS_KEYS } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración de canales (valores sensibles enmascarados)' })
  @ApiResponse({ status: 200, description: 'Mapa de claves con sus valores (API keys aparecen como ****...last4)' })
  getAll() {
    return this.settingsService.getAll();
  }

  @Patch()
  @ApiOperation({ summary: 'Guardar/actualizar una o más claves de configuración' })
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Par clave-valor de configuración. Claves válidas: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_WABA_ID, BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME',
      example: { BREVO_API_KEY: 'xkeysib-xxx', WHATSAPP_TOKEN: 'EAAxxxxx' },
    },
  })
  @ApiResponse({ status: 200, description: 'Configuración guardada. Retorna { ok: true }' })
  async upsertMany(@Body() body: Partial<Record<SettingKey, string>>) {
    await this.settingsService.upsertMany(body);
    return { ok: true };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Eliminar una clave de configuración (vuelve al valor del .env)' })
  @ApiParam({ name: 'key', description: 'Clave a eliminar', enum: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_ID', 'WHATSAPP_WABA_ID', 'BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'BREVO_SENDER_NAME'] })
  @ApiResponse({ status: 200, description: 'Clave eliminada. Retorna { ok: true }' })
  @ApiResponse({ status: 200, description: 'Clave no reconocida. Retorna { ok: false, message }' })
  async remove(@Param('key') key: string) {
    if (!SETTINGS_KEYS.includes(key as SettingKey)) {
      return { ok: false, message: 'Clave no reconocida' };
    }
    await this.settingsService.remove(key as SettingKey);
    return { ok: true };
  }
}
