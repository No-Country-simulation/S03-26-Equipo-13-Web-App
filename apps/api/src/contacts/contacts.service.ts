import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactDto } from './create-contact.dto';

@Injectable()
export class ContactsService {
  // Inject PrismaService — never instantiate PrismaClient directly in a service
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string, busqueda?: string, page = 1, limit?: number) {
    const take = limit || 10;
    const skip = (page - 1) * take;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contact.findMany({
        where: {
          ...(status && { status: status as ContactStatus }),
          ...(busqueda && {
            OR: [
              { name: { contains: busqueda, mode: 'insensitive' } },
              { email: { contains: busqueda, mode: 'insensitive' } },
              { phone: { contains: busqueda, mode: 'insensitive' } },
            ],
          }),
        },
        include: { tags: true, assignedTo: { select: { id: true, name: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({
        where: {
          ...(status && { status: status as ContactStatus }),
          ...(busqueda && {
            OR: [
              { name: { contains: busqueda, mode: 'insensitive' } },
              { email: { contains: busqueda, mode: 'insensitive' } },
              { phone: { contains: busqueda, mode: 'insensitive' } },
            ],
          }),
        },
      }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        tags: true,
        tasks: { orderBy: { dueDate: 'asc' } },
        messages: { orderBy: { createdAt: 'desc' }, take: 50 },
        assignedTo: { select: { id: true, name: true } },
      },
    });
    if (!contact) throw new NotFoundException(`Contacto ${id} no encontrado`);
    return contact;
  }

  async create(data: CreateContactDto) {
    return this.prisma.contact.create({
      data,
      include: { tags: true },
    });
  }

  async update(id: string, data: Partial<CreateContactDto>) {
    await this.findOne(id); // throws 404 if not found
    return this.prisma.contact.update({
      where: { id },
      data,
      include: { tags: true },
    });
  }

  async updateTags(id: string, tagNames: string[]) {
    await this.findOne(id);

    const tags = await Promise.all(
      tagNames.map((name) =>
        this.prisma.tag.upsert({ where: { name }, update: {}, create: { name } }),
      ),
    );

    return this.prisma.contact.update({
      where: { id },
      data: { tags: { set: tags.map((t) => ({ id: t.id })) } },
      include: { tags: true },
    });
  }

  async remove(id: string) {
    // Role enforcement (admin only) is handled by @Roles + RolesGuard in the controller
    await this.findOne(id);
    return this.prisma.contact.delete({ where: { id } });
  }
}
