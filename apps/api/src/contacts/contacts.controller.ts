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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './create-contact.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))       // All contact endpoints require authentication
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contactos con filtros y paginación' })
  findAll(
    @Query('status') status?: string,
    @Query('busqueda') busqueda?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactsService.findAll(status, busqueda, Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener contacto con historial de mensajes y tareas' })
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear contacto nuevo' })
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar datos del contacto o cambiar estado en el funnel' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateContactDto>) {
    return this.contactsService.update(id, dto);
  }

  @Patch(':id/tags')
  @ApiOperation({ summary: 'Asignar o quitar etiquetas al contacto' })
  updateTags(@Param('id') id: string, @Body('tags') tags: string[]) {
    return this.contactsService.updateTags(id, tags);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)           // Only admins can delete contacts
  @ApiOperation({ summary: 'Eliminar contacto — solo rol admin' })
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }

  // ── Tags endpoints ─────────────────────────────────────────────────────────
  @Get('tags')
  @ApiOperation({ summary: 'Listar todas las etiquetas del sistema' })
  listTags() {
    return this.contactsService.listTags();
  }

  @Post('tags')
  @ApiOperation({ summary: 'Crear etiqueta nueva' })
  createTag(@Body('name') name: string) {
    return this.contactsService.createTag(name);
  }

  @Delete('tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar etiqueta' })
  deleteTag(@Param('tagId') tagId: string) {
    return this.contactsService.deleteTag(tagId);
  }
}
