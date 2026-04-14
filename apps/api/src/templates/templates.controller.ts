import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './templates.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar plantillas de WhatsApp con estado de aprobación de Meta' })
  @ApiResponse({ status: 200, description: 'Lista de plantillas con metaStatus sincronizado' })
  findAll() {
    return this.templatesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear plantilla nueva y enviarla a Meta para revisión' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({ status: 201, description: 'Plantilla creada y enviada a Meta (metaStatus: pending)' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o error al comunicarse con Meta' })
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar plantilla de la BD y de Meta (best-effort)' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla (UUID)' })
  @ApiResponse({ status: 200, description: 'Plantilla eliminada localmente y en Meta si era posible' })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de Meta — notificación de aprobación/rechazo de plantilla' })
  @ApiBody({ schema: { type: 'object', description: 'Payload enviado por Meta Cloud API al aprobar o rechazar una plantilla' } })
  @ApiResponse({ status: 201, description: 'Webhook procesado — metaStatus actualizado en la BD' })
  handleMetaApproval(@Body() payload: any) {
    return this.templatesService.handleMetaApproval(payload);
  }
}
