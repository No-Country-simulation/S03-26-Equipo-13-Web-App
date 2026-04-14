import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ example: 'cliente@ejemplo.com' })
  @IsEmail()
  to: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  toName?: string;

  @ApiProperty({ example: 'Seguimiento de tu solicitud' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: '<p>Hola <b>Juan</b>, aquí va el contenido...</p>' })
  @IsNotEmpty()
  @IsString()
  htmlContent: string;

  @ApiPropertyOptional({ description: 'ID del contacto en la BD para guardar historial' })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({ example: 'responder@vigu.blog' })
  @IsOptional()
  @IsEmail()
  replyTo?: string;
}
