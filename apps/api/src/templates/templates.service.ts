import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTemplateDto } from './templates.dto';

// Meta sends one of these statuses when approving/rejecting a template
type MetaApprovalStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // Returns all templates; the `category` field encodes the Meta approval status in practice
    return this.prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateTemplateDto) {
    // Limpiamos el nombre para que Meta no lo rechace (sin espacios, minúsculas)
    const metaName = dto.name.toLowerCase().trim().replace(/\s+/g, '_');
    const metaUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    try {
      const response = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metaName,
          language: 'es',
          category: dto.category.toUpperCase(), // Meta exige: MARKETING, UTILITY o AUTHENTICATION
          components: [
            {
              type: 'BODY',
              text: dto.content,
            },
          ],
        }),
      });

      const metaResult = await response.json();

      if (metaResult.error) {
        this.logger.error('Error de Meta:', metaResult.error);
        throw new Error(
          `Meta rechazó la creación: ${metaResult.error.message}`,
        );
      }

      // 4. Si Meta aceptó la petición, guardamos en nuestra DB
      return this.prisma.template.create({
        data: {
          name: metaName, // Guardamos el nombre "limpio" que enviamos a Meta
          content: dto.content,
          category: 'pending', // Inicialmente queda pendiente hasta que el webhook avise
        },
      });
    } catch (error) {
      this.logger.error('Error al sincronizar con Meta:', error);
      throw error;
    }
  }

  // POST /templates/webhook — Meta calls this when a template is approved or rejected
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

      // Store the Meta approval status inside the category field
      // (extend the schema with a dedicated `metaStatus` column for a cleaner solution)
      await this.prisma.template.update({
        where: { id: template.id },
        data: { category: status.toLowerCase() },
      });

      this.logger.log(`Template "${templateName}" → ${status}`);
      return { received: true };
    } catch (err) {
      this.logger.error('Meta approval webhook error', err);
      return { received: true };
    }
  }
}
