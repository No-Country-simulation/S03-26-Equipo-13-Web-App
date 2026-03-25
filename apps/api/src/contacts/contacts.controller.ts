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
  ) {
    return this.contactsService.findAll(status, busqueda, Number(page) || 1);
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
}
