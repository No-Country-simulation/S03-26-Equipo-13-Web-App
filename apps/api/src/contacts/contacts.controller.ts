import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './create-contact.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)       // All contact endpoints require authentication
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contactos con filtros y paginación' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado del funnel (lead, prospect, client, inactive)' })
  @ApiQuery({ name: 'busqueda', required: false, description: 'Búsqueda por nombre, email o teléfono' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Resultados por página', example: 10 })
  @ApiResponse({ status: 200, description: 'Lista paginada de contactos' })
  findAll(
    @Query('status') status?: string,
    @Query('busqueda') busqueda?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactsService.findAll(status, busqueda, Number(page) || 1, Number(limit) || 10);
  }

  // ── Tags endpoints — must come BEFORE :id to avoid route shadowing ─────────
  @Get('tags')
  @ApiOperation({ summary: 'Listar todas las etiquetas del sistema' })
  listTags() {
    return this.contactsService.listTags();
  }

  @Post('tags')
  @ApiOperation({ summary: 'Crear etiqueta nueva' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'Cliente VIP' } }, required: ['name'] } })
  @ApiResponse({ status: 201, description: 'Etiqueta creada' })
  createTag(@Body('name') name: string) {
    return this.contactsService.createTag(name);
  }

  @Delete('tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar etiqueta' })
  @ApiParam({ name: 'tagId', description: 'ID de la etiqueta' })
  @ApiResponse({ status: 204, description: 'Etiqueta eliminada' })
  @ApiResponse({ status: 404, description: 'Etiqueta no encontrada' })
  deleteTag(@Param('tagId') tagId: string) {
    return this.contactsService.deleteTag(tagId);
  }

  // ── Contact CRUD ───────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Obtener contacto con historial de mensajes y tareas' })
  @ApiParam({ name: 'id', description: 'ID del contacto (UUID)' })
  @ApiResponse({ status: 200, description: 'Datos del contacto con mensajes y tareas incluidos' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear contacto nuevo' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: 'Contacto creado y sincronizado con Brevo' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar datos del contacto o cambiar estado en el funnel' })
  @ApiParam({ name: 'id', description: 'ID del contacto (UUID)' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 200, description: 'Contacto actualizado' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateContactDto>) {
    return this.contactsService.update(id, dto);
  }

  @Patch(':id/tags')
  @ApiOperation({ summary: 'Asignar o quitar etiquetas al contacto' })
  @ApiParam({ name: 'id', description: 'ID del contacto (UUID)' })
  @ApiBody({ schema: { type: 'object', properties: { tags: { type: 'array', items: { type: 'string' }, example: ['tag-uuid-1', 'tag-uuid-2'] } }, required: ['tags'] } })
  @ApiResponse({ status: 200, description: 'Etiquetas actualizadas' })
  updateTags(@Param('id') id: string, @Body('tags') tags: string[]) {
    return this.contactsService.updateTags(id, tags);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar contacto — solo rol admin' })
  @ApiParam({ name: 'id', description: 'ID del contacto (UUID)' })
  @ApiResponse({ status: 200, description: 'Contacto eliminado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado — se requiere rol admin' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
