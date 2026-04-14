import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Llamar para seguimiento' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Preguntar sobre la propuesta enviada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'pending',
    enum: ['pending', 'in_progress', 'completed'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-04-20T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'ID del contacto asociado' })
  @IsNotEmpty()
  @IsString()
  contactId: string;

  @ApiPropertyOptional({ description: 'ID del agente asignado' })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}
