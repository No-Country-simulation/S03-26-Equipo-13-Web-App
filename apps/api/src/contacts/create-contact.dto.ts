import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactStatus } from '@prisma/client';

export class CreateContactDto {
  @ApiProperty({ example: 'María García' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'maria@empresa.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ContactStatus, default: ContactStatus.new })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'ID del agente asignado' })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}
