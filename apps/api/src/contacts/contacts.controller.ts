import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './create-contact.dto';
import { Contact } from '@prisma/client';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contactos con filtros y paginación' })
  async findAll(
    @Query('status') status?: string,
    @Query('busqueda') busqueda?: string,
    @Query('page') page?: string,
  ): Promise<Contact[]> {
    return this.contactsService.findAll(status, busqueda, Number(page) || 1);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contacto con historial' })
  async findOne(@Param('id') id: string): Promise<Contact | null> {
    return this.contactsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un contacto nuevo' })
  async create(@Body() dto: CreateContactDto): Promise<Contact> {
    return this.contactsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar datos del contacto' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateContactDto>,
  ): Promise<Contact> {
    return this.contactsService.update(id, dto);
  }

  @Patch(':id/tags')
  @ApiOperation({ summary: 'Asignar o quitar etiquetas' })
  async updateTags(
    @Param('id') id: string,
    @Body('tags') tags: string[],
  ): Promise<Contact> {
    return this.contactsService.updateTags(id, tags);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar contacto' })
  async remove(@Param('id') id: string): Promise<Contact> {
    return this.contactsService.remove(id);
  }
}
