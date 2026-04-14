import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export const SETTINGS_KEYS = [
  'WHATSAPP_TOKEN',
  'WHATSAPP_PHONE_ID',
  'WHATSAPP_BUSINESS_ACCOUNT_ID',
  'WEBHOOK_VERIFY_TOKEN',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME',
] as const;

export type SettingKey = (typeof SETTINGS_KEYS)[number];

const SENSITIVE_KEYS: SettingKey[] = ['WHATSAPP_TOKEN', 'BREVO_API_KEY'];

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Get a single setting value — DB first, then env fallback */
  async get(key: SettingKey): Promise<string | undefined> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    if (row?.value) return row.value;
    return this.config.get<string>(key);
  }

  /** Get all settings (masks sensitive values for frontend display).
   *  Priority: DB row → env fallback. Both sources are reflected. */
  async getAll(): Promise<Record<string, string | null>> {
    const rows = await this.prisma.setting.findMany();
    const dbMap = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    const result: Record<string, string | null> = {};
    for (const key of SETTINGS_KEYS) {
      // DB value takes precedence; fall back to env
      const val = dbMap[key] ?? this.config.get<string>(key) ?? null;
      if (val && SENSITIVE_KEYS.includes(key as SettingKey)) {
        result[key] = '••••••••';
        result[`${key}_SET`] = 'true';
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  /** Upsert multiple settings at once */
  async upsertMany(data: Partial<Record<SettingKey, string>>): Promise<void> {
    const entries = Object.entries(data).filter(
      ([k, v]) => SETTINGS_KEYS.includes(k as SettingKey) && v !== undefined && v !== '',
    );

    await Promise.all(
      entries.map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          create: { key, value: value! },
          update: { value: value! },
        }),
      ),
    );
  }

  /** Delete a setting (revert to env fallback) */
  async remove(key: SettingKey): Promise<void> {
    await this.prisma.setting.deleteMany({ where: { key } });
  }
}
