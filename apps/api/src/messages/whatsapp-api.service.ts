import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MetaTextPayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: { body: string; preview_url?: boolean };
}

export interface MetaTemplatePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: 'body' | 'header' | 'button';
      parameters: Array<{ type: 'text'; text: string }>;
    }>;
  };
}

export interface MetaSendResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string; message_status: string }>;
}

export type MetaPayload = MetaTextPayload | MetaTemplatePayload;

@Injectable()
export class WhatsappApiService {
  private readonly logger = new Logger(WhatsappApiService.name);
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';

  constructor(private readonly config: ConfigService) {}

  private get token(): string {
    return this.config.getOrThrow<string>('WHATSAPP_TOKEN');
  }

  private get phoneId(): string {
    return this.config.getOrThrow<string>('WHATSAPP_PHONE_ID');
  }

  // ── Send any payload to Meta ───────────────────────────────────────────────
  async send(payload: MetaPayload): Promise<MetaSendResponse> {
    const url = `${this.baseUrl}/${this.phoneId}/messages`;

    let lastError: Error | null = null;

    // Retry up to 3 times with exponential backoff (Meta rate limit: 80 msg/s)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
          const code = error?.error?.code;
          const msg = error?.error?.message ?? res.statusText;

          // Non-retryable Meta error codes
          const permanent = [131030, 131047, 131051, 132000, 132001];
          if (permanent.includes(code)) {
            throw new BadGatewayException(`Meta error ${code}: ${msg}`);
          }

          throw new Error(`Meta HTTP ${res.status} (code ${code}): ${msg}`);
        }

        return (await res.json()) as MetaSendResponse;
      } catch (err) {
        lastError = err as Error;

        if (err instanceof BadGatewayException) throw err; // don't retry permanent errors

        if (attempt < 3) {
          const delay = attempt * 1000; // 1s, 2s
          this.logger.warn(`Meta send attempt ${attempt} failed — retrying in ${delay}ms`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw new BadGatewayException(`Meta API unreachable after 3 attempts: ${lastError?.message}`);
  }

  // ── Build text payload ─────────────────────────────────────────────────────
  buildTextPayload(to: string, body: string): MetaTextPayload {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body, preview_url: false },
    };
  }

  // ── Build template payload ─────────────────────────────────────────────────
  buildTemplatePayload(
    to: string,
    templateName: string,
    variables: string[] = [],
    languageCode = 'es',
  ): MetaTemplatePayload {
    const payload: MetaTemplatePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    if (variables.length > 0) {
      payload.template.components = [
        {
          type: 'body',
          parameters: variables.map((v) => ({ type: 'text', text: v })),
        },
      ];
    }

    return payload;
  }

  // ── Mark message as read ───────────────────────────────────────────────────
  async markAsRead(wamid: string): Promise<void> {
    const url = `${this.baseUrl}/${this.phoneId}/messages`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: wamid,
      }),
    }).catch((err) => this.logger.warn(`markAsRead failed for ${wamid}: ${err.message}`));
  }
}
