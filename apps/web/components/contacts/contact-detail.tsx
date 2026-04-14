"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useContactsStore } from "@/store/contactsStore";
import { MessageCircle, Mail, Phone, CheckCheck, Clock, X, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/config";
import { useSendWhatsapp } from "@/hooks/use-whatsapp";
import { useSendEmail } from "@/hooks/use-messages";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
type MessageStatus = "sent" | "delivered" | "read" | "failed";
type MessageChannel = "whatsapp" | "email" | "sms";
type MessageDirection = "inbound" | "outbound";

interface Message {
  id: string;
  content: string;
  subject?: string;
  direction: MessageDirection;
  channel: MessageChannel;
  status: MessageStatus;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
}

interface ContactDetail {
  id: string;
  name: string;
  email?: string;
  phone: string;
  status: string;
  notes?: string;
  messages: Message[];
  tasks: Task[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

// Status ticks for WhatsApp
function WaStatusIcon({ status }: { status: MessageStatus }) {
  if (status === "read") return <CheckCheck className="w-3 h-3 text-blue-400" />;
  if (status === "delivered") return <CheckCheck className="w-3 h-3 text-slate-400" />;
  if (status === "failed") return <X className="w-3 h-3 text-red-400" />;
  return <Clock className="w-3 h-3 text-slate-300" />;
}

// Channel badge
function ChannelBadge({ channel }: { channel: MessageChannel }) {
  if (channel === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-green-600 bg-green-50 border border-green-100 rounded px-1 py-0.5">
        <MessageCircle className="w-2.5 h-2.5" /> WA
      </span>
    );
  }
  if (channel === "email") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded px-1 py-0.5">
        <Mail className="w-2.5 h-2.5" /> Email
      </span>
    );
  }
  return null;
}

// Group messages by day
function groupByDay(messages: Message[]): Record<string, Message[]> {
  const groups: Record<string, Message[]> = {};
  for (const m of messages) {
    const day = new Date(m.createdAt).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(m);
  }
  return groups;
}

// Derive which channels a contact has actively used
function usedChannels(messages: Message[]): MessageChannel[] {
  const set = new Set(messages.map((m) => m.channel));
  return Array.from(set) as MessageChannel[];
}

const TASK_STYLE: Record<string, string> = {
  pending:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-50  text-blue-700  border-blue-200",
  done:        "bg-green-50 text-green-700 border-green-200",
  cancelled:   "bg-red-50   text-red-700   border-red-200",
};
const TASK_LABEL: Record<string, string> = {
  pending: "Pendiente", in_progress: "En curso", done: "Hecho", cancelled: "Cancelada",
};

// ── Contact channel summary ───────────────────────────────────────────────────
function ContactChannelSummary({ contact, messages }: { contact: ContactDetail; messages: Message[] }) {
  const active = usedChannels(messages);
  const hasWa = !!contact.phone;
  const hasEmail = !!contact.email;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${hasWa ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
          <MessageCircle className="w-3 h-3" />
          WhatsApp
          {active.includes("whatsapp") && <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-0.5" />}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${hasEmail ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
          <Mail className="w-3 h-3" />
          Email
          {active.includes("email") && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-0.5" />}
        </span>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isOut = msg.direction === "outbound";
  const isWa = msg.channel === "whatsapp";
  const isEmail = msg.channel === "email";

  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"} mb-1.5`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isOut
            ? isWa
              ? "bg-green-100 text-green-900 rounded-br-sm"
              : "bg-blue-100 text-blue-900 rounded-br-sm"
            : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
        }`}
      >
        {/* Email subject */}
        {isEmail && msg.subject && (
          <p className="text-[10px] font-bold text-blue-500 mb-0.5 uppercase tracking-wide">
            {msg.subject}
          </p>
        )}
        <p className="leading-snug">{msg.content}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <ChannelBadge channel={msg.channel} />
          <span className="text-[9px] text-slate-400">{formatDate(msg.createdAt)}</span>
          {isOut && isWa && <WaStatusIcon status={msg.status} />}
        </div>
      </div>
    </div>
  );
}

// ── Compose area ─────────────────────────────────────────────────────────────
function ComposeArea({ contact, onSent }: { contact: ContactDetail; onSent: () => void }) {
  const [mode, setMode] = useState<"whatsapp" | "email" | null>(null);
  const [waText, setWaText] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const queryClient = useQueryClient();

  const { mutate: sendWa, isPending: sendingWa } = useSendWhatsapp();
  const { mutate: sendEmail, isPending: sendingEmail } = useSendEmail();

  const handleSendWa = useCallback(() => {
    const trimmed = waText.trim();
    if (!trimmed) return;
    sendWa(
      { contactId: contact.id, content: trimmed },
      {
        onSuccess: () => {
          setWaText("");
          setMode(null);
          queryClient.invalidateQueries({ queryKey: ["messages", contact.id] });
          onSent();
          toast.success("Mensaje enviado");
        },
        onError: (e) => toast.error("Error: " + e.message),
      }
    );
  }, [waText, contact.id, sendWa, queryClient, onSent]);

  const handleSendEmail = useCallback(() => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Completa asunto y mensaje");
      return;
    }
    sendEmail(
      { contactId: contact.id, subject: emailSubject, content: emailBody },
      {
        onSuccess: () => {
          setEmailSubject("");
          setEmailBody("");
          setMode(null);
          queryClient.invalidateQueries({ queryKey: ["messages", contact.id] });
          onSent();
          toast.success("Email enviado");
        },
        onError: (e) => toast.error("Error: " + e.message),
      }
    );
  }, [emailSubject, emailBody, contact.id, sendEmail, queryClient, onSent]);

  const hasPhone = !!contact.phone;
  const hasEmail = !!contact.email;

  if (!hasPhone && !hasEmail) return null;

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-3 shrink-0">
      {/* Channel selector buttons */}
      {mode === null && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Enviar por:</span>
          {hasPhone && (
            <button
              onClick={() => setMode("whatsapp")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-100 text-xs font-semibold hover:bg-green-100 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
          )}
          {hasEmail && (
            <button
              onClick={() => setMode("email")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
          )}
        </div>
      )}

      {/* WhatsApp compose */}
      {mode === "whatsapp" && (
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(null)} className="text-slate-400 hover:text-slate-600 text-xs shrink-0">✕</button>
          <Input
            autoFocus
            value={waText}
            onChange={(e) => setWaText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendWa(); } }}
            placeholder="Mensaje de WhatsApp... (Enter para enviar)"
            className="flex-1 h-9 text-sm bg-slate-50 border-slate-200"
            disabled={sendingWa}
          />
          <Button
            size="sm"
            onClick={handleSendWa}
            disabled={sendingWa || !waText.trim()}
            className="bg-green-600 hover:bg-green-700 h-9 px-3"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Email compose */}
      {mode === "email" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setMode(null)} className="text-slate-400 hover:text-slate-600 text-xs shrink-0">✕</button>
            <Input
              autoFocus
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Asunto del email"
              className="flex-1 h-8 text-sm bg-slate-50 border-slate-200"
            />
          </div>
          <Textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Escribe el mensaje..."
            className="text-sm bg-slate-50 border-slate-200 min-h-[70px] resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="h-8 text-xs">
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSendEmail}
              disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
              className="bg-blue-600 hover:bg-blue-700 h-8 text-xs px-4"
            >
              {sendingEmail ? "Enviando..." : "Enviar email"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ContactDetail() {
  const token = useAuthStore((s) => s.token);
  const { selectedId, setSelectedId } = useContactsStore();
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"todos" | "whatsapp" | "email">("todos");

  const loadContact = useCallback(() => {
    if (!selectedId || !token) return;
    setLoading(true);
    fetch(`${API_URL}/contacts/${selectedId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setContact)
      .finally(() => setLoading(false));
  }, [selectedId, token]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const messages: Message[] = contact?.messages ?? [];
  const filteredMsgs = activeTab === "todos"
    ? messages
    : messages.filter((m) => m.channel === activeTab);
  const grouped = groupByDay([...filteredMsgs].reverse()); // oldest first

  const waCount = messages.filter((m) => m.channel === "whatsapp").length;
  const emailCount = messages.filter((m) => m.channel === "email").length;

  return (
    <Dialog open={!!selectedId} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-white p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100">
          <DialogTitle className="text-base font-bold text-slate-900">
            {loading ? "Cargando..." : contact?.name ?? "Contacto"}
          </DialogTitle>
          <DialogDescription className="sr-only">Detalle del contacto</DialogDescription>

          {contact && (
            <div className="mt-2 space-y-2">
              {/* Contact info row */}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {contact.phone}
                  </span>
                )}
                {contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {contact.email}
                  </span>
                )}
              </div>
              {/* Channel indicators */}
              <ContactChannelSummary contact={contact} messages={messages} />
            </div>
          )}
        </DialogHeader>

        {contact && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tab bar */}
            <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-slate-100">
              {(["todos", "whatsapp", "email"] as const).map((tab) => {
                const count = tab === "todos" ? messages.length : tab === "whatsapp" ? waCount : emailCount;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-t-lg border-b-2 transition-colors ${
                      activeTab === tab
                        ? tab === "whatsapp"
                          ? "border-green-500 text-green-700 bg-green-50/40"
                          : tab === "email"
                            ? "border-blue-500 text-blue-700 bg-blue-50/40"
                            : "border-indigo-500 text-indigo-700 bg-indigo-50/40"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab === "whatsapp" && <MessageCircle className="w-3 h-3" />}
                    {tab === "email" && <Mail className="w-3 h-3" />}
                    {tab === "todos" ? "Todos" : tab === "whatsapp" ? "WhatsApp" : "Email"}
                    {count > 0 && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === tab ? "bg-white/70 text-current" : "bg-slate-100 text-slate-500"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50/50 min-h-0">
              {filteredMsgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                  <p className="text-xs">Sin mensajes en este canal</p>
                </div>
              ) : (
                Object.entries(grouped).map(([day, msgs]) => (
                  <div key={day}>
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[10px] text-slate-400 font-medium">{formatDay(msgs[0].createdAt)}</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    {msgs.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} />
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Tasks */}
            {contact.tasks && contact.tasks.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3 max-h-40 overflow-y-auto shrink-0">
                <h3 className="text-xs font-bold text-slate-600 mb-2">Tareas ({contact.tasks.length})</h3>
                <div className="space-y-1.5">
                  {contact.tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-xs text-slate-700 font-medium">{t.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${TASK_STYLE[t.status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        {TASK_LABEL[t.status] ?? t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compose area — send WhatsApp or Email */}
            <ComposeArea contact={contact} onSent={loadContact} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
