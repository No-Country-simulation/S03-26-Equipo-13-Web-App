import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BrevoApiService {
    private readonly logger = new Logger(BrevoApiService.name);
    private readonly brevoUrl = 'https://api.brevo.com/v3/smtp/email';

    constructor(private readonly config: ConfigService) { }

    async sendEmail(toEmail: string, toName: string, subject: string, content: string) {
        const apiKey = this.config.getOrThrow<string>('BREVO_API_KEY');

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
                    name: this.config.get('BREVO_FROM_NAME'),
                    email: this.config.get('BREVO_FROM_EMAIL')
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
}
