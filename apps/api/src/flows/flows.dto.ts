import { IsString, IsArray, IsBoolean, IsOptional, ValidateNested, IsEnum } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Payload del paso (mensaje, delay en ms, nuevo estado, etc.)' })
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

  @ApiProperty({ type: [FlowStepDto] })
  @IsArray()
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
  @ValidateNested({ each: true })
  @Type(() => FlowStepDto)
  steps?: FlowStepDto[];
}
