import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class SetupChannelsDto {
  @ApiPropertyOptional({ example: '+573001234567' })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional({ example: 'ventas@startup.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
