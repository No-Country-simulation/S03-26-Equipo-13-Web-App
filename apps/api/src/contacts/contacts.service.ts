import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ContactStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FlowsService } from 'src/flows/flows.service';
import { FlowTrigger } from 'src/flows/flows.dto';
import { BrevoApiService } from 'src/messages/brevo-api.service';
import { CreateContactDto } from './create-contact.dto';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly flowsService: FlowsService,
    private readonly brevoApi: BrevoApiService,
  ) {}

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
    const contact = await this.prisma.contact.create({
      data,
      include: { tags: true },
    });

    // Sync to Brevo if contact has email (fire-and-forget)
    if (contact.email) {
      this.brevoApi
        .syncContact(contact.email, contact.name, contact.phone)
        .catch((err) => this.logger.error(`Brevo sync error on create: ${err.message}`));
    }

    // Disparar flujos con trigger contact_created (sin bloquear la respuesta)
    this.flowsService
      .triggerByEvent(FlowTrigger.contact_created, contact.id)
      .catch((err) => this.logger.error(`Error triggering contact_created flows: ${err.message}`));

    return contact;
  }

  async update(id: string, data: Partial<CreateContactDto>) {
    const before = await this.findOne(id);
    const updated = await this.prisma.contact.update({
      where: { id },
      data,
      include: { tags: true },
    });

    // Sync to Brevo if email is present (updated or pre-existing)
    const syncEmail = updated.email ?? before.email;
    if (syncEmail) {
      this.brevoApi
        .syncContact(syncEmail, updated.name, updated.phone)
        .catch((err) => this.logger.error(`Brevo sync error on update: ${err.message}`));
    }

    // Disparar flujos status_changed si el estado cambió
    if (data.status && data.status !== before.status) {
      this.flowsService
        .triggerByEvent(FlowTrigger.status_changed, id)
        .catch((err) => this.logger.error(`Error triggering status_changed flows: ${err.message}`));
    }

    return updated;
  }

  async updateTags(id: string, tagNames: string[]) {
    await this.findOne(id);

    const tags = await Promise.all(
      tagNames.map((name) =>
        this.prisma.tag.upsert({ where: { name }, update: {}, create: { name } }),
      ),
    );

    const updated = await this.prisma.contact.update({
      where: { id },
      data: { tags: { set: tags.map((t) => ({ id: t.id })) } },
      include: { tags: true },
    });

    // Disparar flujos tag_added si se agregaron etiquetas
    if (tagNames.length > 0) {
      this.flowsService
        .triggerByEvent(FlowTrigger.tag_added, id)
        .catch((err) => this.logger.error(`Error triggering tag_added flows: ${err.message}`));
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contact.delete({ where: { id } });
  }

  // ── Tags CRUD ──────────────────────────────────────────────────────────────
  async listTags() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  async createTag(name: string) {
    const clean = name.trim().toLowerCase().replace(/\s+/g, '-');
    return this.prisma.tag.upsert({ where: { name: clean }, update: {}, create: { name: clean } });
  }

  async deleteTag(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }
}
