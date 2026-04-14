"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Mail, X, Plus, Loader2, Save, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTags, useCreateTag, useDeleteTag, tagColor } from "@/hooks/use-tags";
import { useSettings, useSaveSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

// ── Small helper: masked input that shows/hides sensitive values ──────────────
function SecretInput({
  value,
  onChange,
  placeholder,
  isSet,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isSet?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isSet && !value ? "••••••••  (guardado)" : placeholder}
        className="pr-10 bg-slate-50/50 border-slate-200 rounded-xl h-9 text-sm shadow-none font-mono"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ isSet }: { isSet: boolean }) {
  return isSet ? (
    <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px] px-3 py-0.5 rounded-full flex items-center gap-1">
      <CheckCircle2 className="w-3 h-3" /> Activo
    </Badge>
  ) : (
    <Badge className="bg-amber-50 text-amber-600 border-none font-bold text-[10px] px-3 py-0.5 rounded-full flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> Sin configurar
    </Badge>
  );
}

// ── Labelled field ────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
  // ── Tags ──────────────────────────────────────────────────────────────────
  const { data: tags = [], isLoading: tagsLoading } = useTags();
  const { mutate: createTag, isPending: creating } = useCreateTag();
  const { mutate: deleteTag } = useDeleteTag();
  const [newTag, setNewTag] = useState("");

  // ── Channel settings ─────────────────────────────────────────────────────
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { mutate: saveSettings, isPending: saving } = useSaveSettings();

  // WhatsApp fields (local state)
  const [waToken, setWaToken] = useState("");
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waBusinessId, setWaBusinessId] = useState("");
  const [waVerifyToken, setWaVerifyToken] = useState("");

  // Brevo fields (local state)
  const [brevoKey, setBrevoKey] = useState("");
  const [brevoEmail, setBrevoEmail] = useState("");
  const [brevoName, setBrevoName] = useState("");

  // Pre-fill non-sensitive values when settings load
  useEffect(() => {
    if (!settings) return;
    if (settings.WHATSAPP_PHONE_ID) setWaPhoneId(settings.WHATSAPP_PHONE_ID);
    if (settings.WHATSAPP_BUSINESS_ACCOUNT_ID) setWaBusinessId(settings.WHATSAPP_BUSINESS_ACCOUNT_ID);
    if (settings.WEBHOOK_VERIFY_TOKEN) setWaVerifyToken(settings.WEBHOOK_VERIFY_TOKEN);
    if (settings.BREVO_SENDER_EMAIL) setBrevoEmail(settings.BREVO_SENDER_EMAIL);
    if (settings.BREVO_SENDER_NAME) setBrevoName(settings.BREVO_SENDER_NAME);
  }, [settings]);

  const waIsSet = !!(settings?.WHATSAPP_TOKEN_SET || settings?.WHATSAPP_TOKEN);
  const brevoIsSet = !!(settings?.BREVO_API_KEY_SET || settings?.BREVO_API_KEY);

  const handleSaveWhatsapp = () => {
    const data: Record<string, string> = {};
    if (waToken) data.WHATSAPP_TOKEN = waToken;
    if (waPhoneId) data.WHATSAPP_PHONE_ID = waPhoneId;
    if (waBusinessId) data.WHATSAPP_BUSINESS_ACCOUNT_ID = waBusinessId;
    if (waVerifyToken) data.WEBHOOK_VERIFY_TOKEN = waVerifyToken;
    if (!Object.keys(data).length) return;
    saveSettings(data, {
      onSuccess: () => {
        toast.success("Configuración de WhatsApp guardada");
        setWaToken("");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleSaveBrevo = () => {
    const data: Record<string, string> = {};
    if (brevoKey) data.BREVO_API_KEY = brevoKey;
    if (brevoEmail) data.BREVO_SENDER_EMAIL = brevoEmail;
    if (brevoName) data.BREVO_SENDER_NAME = brevoName;
    if (!Object.keys(data).length) return;
    saveSettings(data, {
      onSuccess: () => {
        toast.success("Configuración de Brevo guardada");
        setBrevoKey("");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    createTag(trimmed, { onSuccess: () => setNewTag("") });
  };

  return (
    <div className="bg-slate-50 min-h-screen space-y-6 max-w-6xl mx-auto">

      {/* ── 1. WhatsApp Business ─────────────────────────────────────────── */}
      <div className="bg-white border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-bold text-slate-800">WhatsApp Business</h3>
            <span className="text-xs text-slate-400">Meta Cloud API</span>
          </div>
          {settingsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <StatusBadge isSet={waIsSet} />
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Token de acceso"
            hint="El token permanente de tu app en Meta for Developers"
          >
            <SecretInput
              value={waToken}
              onChange={setWaToken}
              placeholder="EAAVHz..."
              isSet={waIsSet}
            />
          </Field>

          <Field label="Phone ID" hint="ID del número de teléfono en Meta">
            <Input
              value={waPhoneId}
              onChange={(e) => setWaPhoneId(e.target.value)}
              placeholder="1058379..."
              className="bg-slate-50/50 border-slate-200 rounded-xl h-9 text-sm shadow-none font-mono"
            />
          </Field>

          <Field label="Business Account ID" hint="ID de la cuenta de WhatsApp Business">
            <Input
              value={waBusinessId}
              onChange={(e) => setWaBusinessId(e.target.value)}
              placeholder="1253711..."
              className="bg-slate-50/50 border-slate-200 rounded-xl h-9 text-sm shadow-none font-mono"
            />
          </Field>

          <Field
            label="Webhook Verify Token"
            hint="Token secreto para verificar el webhook en Meta"
          >
            <Input
              value={waVerifyToken}
              onChange={(e) => setWaVerifyToken(e.target.value)}
              placeholder="mi-token-secreto-2026"
              className="bg-slate-50/50 border-slate-200 rounded-xl h-9 text-sm shadow-none font-mono"
            />
          </Field>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSaveWhatsapp}
            disabled={saving || (!waToken && !waPhoneId && !waBusinessId && !waVerifyToken)}
            className="bg-[#6366f1] hover:bg-[#5558e3] rounded-xl px-5 h-9 text-xs font-bold"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Guardar WhatsApp</>}
          </Button>
        </div>
      </div>

      {/* ── 2. Correo — Brevo ────────────────────────────────────────────── */}
      <div className="bg-white border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800">Correo electrónico</h3>
            <span className="text-xs text-slate-400">Brevo SMTP</span>
          </div>
          {settingsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <StatusBadge isSet={brevoIsSet} />
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="API Key de Brevo"
            hint="La encuentras en tu cuenta Brevo → SMTP & API → API Keys"
          >
            <SecretInput
              value={brevoKey}
              onChange={setBrevoKey}
              placeholder="xkeysib-..."
              isSet={brevoIsSet}
            />
          </Field>

          <Field label="Email del remitente" hint="Dirección desde la que se enviarán los correos">
            <Input
              value={brevoEmail}
              onChange={(e) => setBrevoEmail(e.target.value)}
              placeholder="no-reply@tudominio.com"
              className="bg-slate-50/50 border-slate-200 rounded-xl h-9 text-sm shadow-none"
            />
          </Field>

          <Field label="Nombre del remitente" hint="Nombre visible en el cliente de correo">
            <Input
              value={brevoName}
              onChange={(e) => setBrevoName(e.target.value)}
              placeholder="Mi empresa CRM"
              className="bg-slate-50/50 border-slate-200 rounded-xl h-9 text-sm shadow-none"
            />
          </Field>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSaveBrevo}
            disabled={saving || (!brevoKey && !brevoEmail && !brevoName)}
            className="bg-[#6366f1] hover:bg-[#5558e3] rounded-xl px-5 h-9 text-xs font-bold"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Guardar Brevo</>}
          </Button>
        </div>
      </div>

      {/* ── 3. Etiquetas ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Etiquetas</h3>

        {tagsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
            {tags.length === 0 && (
              <p className="text-xs text-slate-400">Sin etiquetas todavía. Crea la primera.</p>
            )}
            {tags.map((tag) => (
              <div
                key={tag.id}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${tagColor(tag.name)}`}
              >
                {tag.name}
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="opacity-50 hover:opacity-100 transition-opacity ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Nombre de etiqueta..."
            className="flex-1 bg-slate-50/50 border-slate-200 rounded-xl h-10 text-sm shadow-none"
          />
          <Button
            onClick={handleAddTag}
            disabled={!newTag.trim() || creating}
            className="bg-[#6366f1] hover:bg-[#5558e3] rounded-xl px-6 h-10 text-xs font-bold"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5 mr-1.5" />Crear</>}
          </Button>
        </div>
      </div>

      {/* ── 4. Vistas guardadas ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Vistas guardadas</h3>
        <p className="text-[11px] text-slate-400 mb-4">Próximamente podrás guardar filtros de contactos como vistas rápidas.</p>
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <p className="text-xs">Sin vistas guardadas</p>
        </div>
      </div>
    </div>
  );
}
