import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettingsService } from 'src/settings/settings.service';
import { CreateTemplateDto } from './templates.dto';

type MetaApprovalStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  async findAll() {
    return this.prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateTemplateDto) {
    const token = await this.settings.get('WHATSAPP_TOKEN');
    const businessAccountId = await this.settings.get('WHATSAPP_BUSINESS_ACCOUNT_ID');

    if (!token || !businessAccountId) {
      throw new BadRequestException(
        'WhatsApp Token y Business Account ID deben estar configurados en Configuración antes de crear plantillas.',
      );
    }

    // Meta requiere nombre en minúsculas sin espacios
    const metaName = dto.name.toLowerCase().trim().replace(/\s+/g, '_');
    const metaUrl = `https://graph.facebook.com/v19.0/${businessAccountId}/message_templates`;

    let metaResult: any;
    try {
      const response = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metaName,
          language: 'es',
          category: dto.category.toUpperCase(),
          components: [{ type: 'BODY', text: dto.content }],
        }),
      });
      metaResult = await response.json();
    } catch (err) {
      this.logger.error('Error de red al contactar Meta:', err);
      throw new BadRequestException('No se pudo conectar con Meta. Verifica tu conexión.');
    }

    if (metaResult.error) {
      this.logger.error('Meta rechazó la plantilla:', metaResult.error);
      throw new BadRequestException(
        `Meta rechazó la plantilla: ${metaResult.error.message ?? JSON.stringify(metaResult.error)}`,
      );
    }

    return this.prisma.template.create({
      data: {
        name: metaName,
        content: dto.content,
        category: dto.category.toLowerCase(), // guardamos la categoría real
        metaStatus: 'pending',               // estado de aprobación
      },
    });
  }

  async remove(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) throw new NotFoundException(`Plantilla ${id} no encontrada`);

    // Intentar eliminar también de Meta (best-effort)
    const token = await this.settings.get('WHATSAPP_TOKEN');
    const businessAccountId = await this.settings.get('WHATSAPP_BUSINESS_ACCOUNT_ID');
    if (token && businessAccountId) {
      const metaUrl = `https://graph.facebook.com/v19.0/${businessAccountId}/message_templates?name=${template.name}`;
      await fetch(metaUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => this.logger.warn(`No se pudo eliminar plantilla de Meta: ${err.message}`));
    }

    return this.prisma.template.delete({ where: { id } });
  }

  async handleMetaApproval(payload: any) {
    try {
      const event = payload?.entry?.[0]?.changes?.[0]?.value;
      const templateName: string = event?.message_template_name;
      const status: MetaApprovalStatus = event?.event;

      if (!templateName || !status) {
        this.logger.warn('Unrecognised Meta webhook payload', payload);
        return { received: true };
      }

      const template = await this.prisma.template.findFirst({
        where: { name: templateName },
      });
      if (!template) {
        this.logger.warn(`Template "${templateName}" not found in DB`);
        return { received: true };
      }

      await this.prisma.template.update({
        where: { id: template.id },
        data: { metaStatus: status.toLowerCase() },
      });

      this.logger.log(`Template "${templateName}" → ${status}`);
      return { received: true };
    } catch (err) {
      this.logger.error('Meta approval webhook error', err);
      return { received: true };
    }
  }
}
