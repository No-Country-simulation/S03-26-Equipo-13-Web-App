import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tareas con filtros por estado y contacto' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado', enum: ['pending', 'done', 'overdue'] })
  @ApiQuery({ name: 'contactId', required: false, description: 'Filtrar por ID del contacto relacionado' })
  @ApiResponse({ status: 200, description: 'Lista de tareas con contacto asignado incluido' })
  findAll(
    @Query('status') status?: string,
    @Query('contactId') contactId?: string,
  ) {
    return this.tasksService.findAll(status, contactId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear tarea con fecha de vencimiento y recordatorio BullMQ' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Tarea creada. Si dueDate está definido, se programa un recordatorio automático' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o contactId no existe' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Marcar tarea como completada o editar sus datos' })
  @ApiParam({ name: 'id', description: 'ID de la tarea (UUID)' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Tarea actualizada' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }
}
