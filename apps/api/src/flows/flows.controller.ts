import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlowsService } from './flows.service';
import { CreateFlowDto, UpdateFlowDto } from './flows.dto';

@ApiTags('flows')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('flows')
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar flujos con historial de ejecuciones recientes' })
  findAll() {
    return this.flowsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear flujo con trigger, lista de pasos y condición de salida' })
  create(@Body() dto: CreateFlowDto) {
    return this.flowsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Activar o pausar un flujo existente' })
  update(@Param('id') id: string, @Body() dto: UpdateFlowDto) {
    return this.flowsService.update(id, dto);
  }
}
