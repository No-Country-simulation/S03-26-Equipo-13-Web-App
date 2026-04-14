import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Carlos Mendoza' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+525511223344' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[\d\s\-().]{7,20}$/, { message: 'Teléfono inválido' })
  phone: string;

  @ApiPropertyOptional({ example: 'carlos@empresa.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'new', enum: ['new', 'active', 'negotiation', 'closed', 'lost'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Interesado en plan Enterprise' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'ID del agente asignado' })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}
