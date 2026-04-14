import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class BrevoApiService {
    private readonly logger = new Logger(BrevoApiService.name);
    private readonly brevoUrl = 'https://api.brevo.com/v3/smtp/email';
    private readonly brevoContactsUrl = 'https://api.brevo.com/v3/contacts';

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    async sendEmail(toEmail: string, toName: string, subject: string, content: string) {
        const apiKey = await this.settings.get('BREVO_API_KEY');
        if (!apiKey) throw new BadRequestException('Brevo API Key no configurada. Ve a Configuración para añadirla.');

        // Formatear simple: de saltos de línea (\n) a etiquetas html (<br>)
        const htmlContent = `<p>${content.replace(/\n/g, '<br>')}</p>`;

        const response = await fetch(this.brevoUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: await this.settings.get('BREVO_SENDER_NAME') ?? this.config.get('BREVO_SENDER_NAME'),
                    email: await this.settings.get('BREVO_SENDER_EMAIL') ?? this.config.get('BREVO_SENDER_EMAIL'),
                },
                to: [{ email: toEmail, name: toName }],
                subject: subject,
                htmlContent: htmlContent,
                textContent: content,
            })
        });

        if (!response.ok) {
            const err = await response.json();
            this.logger.error(`Error enviando email: ${err.message}`);
            throw new BadRequestException(`Fallo en proveedor de correo: ${err.message}`);
        }

        return true;
    }

    /**
     * Upsert a contact in Brevo's contact list.
     * Silent — never throws, only logs. Call fire-and-forget from ContactsService.
     */
    async syncContact(email: string, name: string, phone?: string | null): Promise<void> {
        const apiKey = await this.settings.get('BREVO_API_KEY');
        if (!apiKey) return; // not configured — skip silently

        const [firstName, ...rest] = name.trim().split(' ');
        const lastName = rest.join(' ') || undefined;

        const body: Record<string, any> = {
            email,
            updateEnabled: true,
            attributes: {
                FIRSTNAME: firstName,
                ...(lastName && { LASTNAME: lastName }),
                ...(phone && { SMS: phone }),
            },
        };

        try {
            const res = await fetch(this.brevoContactsUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                this.logger.warn(`Brevo contact sync failed for ${email}: ${JSON.stringify(err)}`);
            } else {
                this.logger.log(`Brevo contact synced: ${email}`);
            }
        } catch (err) {
            this.logger.warn(`Brevo contact sync error for ${email}: ${err}`);
        }
    }
}
