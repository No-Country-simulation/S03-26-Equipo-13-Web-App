import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './templates.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('templates')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar plantillas de WhatsApp con estado de aprobación de Meta' })
  findAll() {
    return this.templatesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear plantilla nueva' })
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  // Meta calls this — must be public
  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de Meta — notificación de aprobación de plantilla' })
  handleMetaApproval(@Body() payload: any) {
    return this.templatesService.handleMetaApproval(payload);
  }
}
