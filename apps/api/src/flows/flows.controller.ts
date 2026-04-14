import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FlowsService } from './flows.service';
import { CreateFlowDto, UpdateFlowDto } from './flows.dto';

@ApiTags('flows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('flows')
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar flujos con historial de ejecuciones recientes' })
  @ApiResponse({ status: 200, description: 'Lista de flujos con sus pasos y últimas ejecuciones' })
  findAll() {
    return this.flowsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear flujo con trigger, lista de pasos y condición de salida' })
  @ApiBody({ type: CreateFlowDto })
  @ApiResponse({ status: 201, description: 'Flujo creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos — revisa trigger y steps' })
  create(@Body() dto: CreateFlowDto) {
    return this.flowsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Activar o pausar un flujo / actualizar pasos' })
  @ApiParam({ name: 'id', description: 'ID del flujo (UUID)' })
  @ApiBody({ type: UpdateFlowDto })
  @ApiResponse({ status: 200, description: 'Flujo actualizado' })
  @ApiResponse({ status: 404, description: 'Flujo no encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateFlowDto) {
    return this.flowsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un flujo y sus ejecuciones' })
  @ApiParam({ name: 'id', description: 'ID del flujo (UUID)' })
  @ApiResponse({ status: 200, description: 'Flujo eliminado' })
  @ApiResponse({ status: 404, description: 'Flujo no encontrado' })
  remove(@Param('id') id: string) {
    return this.flowsService.remove(id);
  }
}
