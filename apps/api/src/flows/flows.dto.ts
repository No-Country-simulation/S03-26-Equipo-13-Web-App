import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum FlowTrigger {
  contact_created = 'contact_created',
  status_changed = 'status_changed',
  tag_added = 'tag_added',
  manual = 'manual',
}

export enum FlowStepType {
  send_whatsapp = 'send_whatsapp',
  send_email = 'send_email',
  wait = 'wait',
  update_status = 'update_status',
  assign_tag = 'assign_tag',
}

export class FlowStepDto {
  @ApiProperty({ enum: FlowStepType })
  @IsEnum(FlowStepType)
  type: FlowStepType;

  @ApiPropertyOptional({
    description: [
      'Configuración del paso según su tipo:',
      '  send_whatsapp → { templateName: string }',
      '  send_email    → { subject: string, content: string }',
      '  wait          → { delayMs: number }',
      '  update_status → { status: "new"|"active"|"inactive"|"archived" }',
      '  assign_tag    → { tag: string }',
    ].join('\n'),
  })
  @IsOptional()
  config?: Record<string, any>;
}

export class CreateFlowDto {
  @ApiProperty({ example: 'Bienvenida a nuevos contactos' })
  @IsString()
  name: string;

  @ApiProperty({ enum: FlowTrigger })
  @IsEnum(FlowTrigger)
  trigger: FlowTrigger;

  @ApiProperty({ type: [FlowStepDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1, { message: 'El flujo debe tener al menos un paso' })
  @ValidateNested({ each: true })
  @Type(() => FlowStepDto)
  steps: FlowStepDto[];
}

export class UpdateFlowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: [FlowStepDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'El flujo debe tener al menos un paso' })
  @ValidateNested({ each: true })
  @Type(() => FlowStepDto)
  steps?: FlowStepDto[];
}
