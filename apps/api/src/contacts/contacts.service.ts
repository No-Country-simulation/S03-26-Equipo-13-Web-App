import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateContactDto } from './create-contact.dto';

const prisma = new PrismaClient();

@Injectable()
export class ContactsService {
  async findAll(status?: string, busqueda?: string, page = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    return prisma.contact.findMany({
      where: {
        ...(status && { status }),
        ...(busqueda && {
          OR: [
            { name: { contains: busqueda, mode: 'insensitive' } },
            { email: { contains: busqueda, mode: 'insensitive' } },
            { phone: { contains: busqueda, mode: 'insensitive' } },
          ],
        }),
      },
      include: { tags: true },
      skip,
      take,
    });
  }

  async findOne(id: string) {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { tags: true, tasks: true, messages: true },
    });

    if (!contact) throw new NotFoundException(`Contacto ${id} no encontrado`);

    return contact;
  }

  async create(data: CreateContactDto) {
    return prisma.contact.create({ data });
  }

  async update(id: string, data: Partial<CreateContactDto>) {
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contacto ${id} no encontrado`);

    return prisma.contact.update({ where: { id }, data });
  }

  async updateTags(id: string, tagNames: string[]) {
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contacto ${id} no encontrado`);

    const tags = await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );
    return prisma.contact.update({
      where: { id },
      data: { tags: { set: tags.map((t) => ({ id: t.id })) } },
      include: { tags: true },
    });
  }

  async remove(id: string) {
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contacto ${id} no encontrado`);

    return prisma.contact.delete({ where: { id } });
  }
}
