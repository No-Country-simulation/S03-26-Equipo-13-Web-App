import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TemplateCategory {
  marketing = 'marketing',
  utility = 'utility',
  authentication = 'authentication',
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'Bienvenida onboarding' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Hola {{1}}, bienvenido a nuestro CRM.' })
  @IsString()
  content: string;

  @ApiProperty({ enum: TemplateCategory })
  @IsEnum(TemplateCategory)
  category: TemplateCategory;
}
