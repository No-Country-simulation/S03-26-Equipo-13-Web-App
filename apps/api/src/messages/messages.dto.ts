import { IsString, IsUUID, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendWhatsappDto {
  @ApiProperty({ description: 'ID del contacto destinatario' })
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional({
    example: 'Hola, ¿cómo estás?',
    description: 'Texto libre. Requerido si no se usa templateName.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'bienvenida_onboarding',
    description: 'Nombre exacto de la plantilla aprobada en Meta.',
  })
  @IsOptional()
  @IsString()
  templateName?: string;

  @ApiPropertyOptional({
    example: ['Juan', 'Startup CRM'],
    description: 'Variables para reemplazar {{1}}, {{2}}... en la plantilla.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  templateVariables?: string[];

  @ApiPropertyOptional({
    example: 'es',
    default: 'es',
    description: 'Código de idioma de la plantilla.',
  })
  @IsOptional()
  @IsString()
  languageCode?: string;
}

export class SendEmailDto {
  @ApiProperty({ description: 'ID del contacto destinatario' })
  @IsUUID()
  contactId: string;

  @ApiProperty({ example: 'Seguimiento de propuesta' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Hola Juan, te escribimos para...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'ID de plantilla opcional' })
  @IsOptional()
  @IsString()
  templateId?: string;
}

// Status values Meta sends in status webhooks
export enum MetaMessageStatus {
  sent = 'sent',
  delivered = 'delivered',
  read = 'read',
  failed = 'failed',
}
