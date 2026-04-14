"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Send, Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContacts } from "@/hooks/use-contacts";
import { useMessages, useTemplates, useSendWhatsapp, Message } from "@/hooks/use-whatsapp";
import { useChatSocket } from "@/hooks/use-chat-socket";

// ── Status tick icons ──────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: Message["status"] }) {
  if (status === "read")      return <CheckCheck className="w-3 h-3 text-blue-400" />;
  if (status === "delivered") return <CheckCheck className="w-3 h-3 text-slate-400" />;
  if (status === "sent")      return <Check className="w-3 h-3 text-slate-400" />;
  if (status === "failed")    return <AlertCircle className="w-3 h-3 text-red-400" />;
  return <Clock className="w-3 h-3 text-slate-300" />;
}

// ── Format time ────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

// ── Chat panel ─────────────────────────────────────────────────────────────────
function ChatPanel({ contactId, contactName }: { contactId: string; contactName: string }) {
  const { data: messages = [], isLoading } = useMessages(contactId);
  const { data: templates = [] } = useTemplates();
  const { mutate: sendWhatsapp, isPending } = useSendWhatsapp();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Real-time Socket.io
  useChatSocket(contactId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    sendWhatsapp(
      { contactId, content: trimmed },
      { onSuccess: () => setText("") }
    );
  }, [text, isPending, contactId, sendWhatsapp]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplate = (templateName: string) => {
    sendWhatsapp({ contactId, templateName });
  };

  // Only show templates approved by Meta
  const approvedTemplates = templates.filter(
    (t) => t.metaStatus === "approved"
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center px-6 gap-3 shrink-0">
        <Avatar className="h-9 w-9 border border-slate-200">
          <AvatarFallback className="text-indigo-600 text-[10px] font-bold bg-indigo-50">
            {contactName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-none">{contactName}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">WhatsApp</p>
        </div>
      </div>

      {/* Template shortcuts */}
      {approvedTemplates.length > 0 && (
        <div className="px-6 py-2 border-b border-slate-50 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest shrink-0">
            Plantillas:
          </span>
          {approvedTemplates.slice(0, 4).map((t) => (
            <Badge
              key={t.id}
              variant="secondary"
              onClick={() => handleTemplate(t.name)}
              className="bg-white border border-slate-200 text-slate-600 text-[11px] px-3 py-1 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
            >
              {t.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 px-6 py-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
            <p className="text-sm font-medium">Sin mensajes todavía</p>
            <p className="text-xs mt-1">Enviá el primer mensaje o usá una plantilla</p>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((msg) => {
            const isOut = msg.direction === "outbound";
            return (
              <div key={msg.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isOut
                      ? "bg-[#6366f1] text-white rounded-br-none"
                      : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isOut ? "text-indigo-200" : "text-slate-400"}`}>
                    <span className="text-[9px]">{formatTime(msg.createdAt)}</span>
                    {isOut && <StatusIcon status={msg.status} />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2 max-w-5xl mx-auto relative">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribir mensaje... (Enter para enviar)"
            className="flex-1 h-12 bg-slate-50/50 border-slate-200 rounded-2xl text-sm shadow-none focus-visible:ring-1 pr-12"
            disabled={isPending}
          />
          <Button
            onClick={handleSend}
            disabled={isPending || !text.trim()}
            className="absolute right-1 h-10 w-10 p-0 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] shadow-lg shadow-indigo-100 disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function WhatsappPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: contacts = [], isLoading } = useContacts();

  const filtered = contacts.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  const selectedContact = contacts.find((c: any) => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-130px)] overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">

      {/* Left — Contact list */}
      <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar contacto..."
              className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-sm shadow-none"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoading && (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-11 w-11 rounded-full bg-slate-100 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-32 rounded bg-slate-100" />
                    <div className="h-2.5 w-24 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="p-4 text-xs text-slate-400 text-center">Sin contactos</p>
          )}

          {filtered.map((contact: any) => {
            const isActive = contact.id === selectedId;
            return (
              <div
                key={contact.id}
                onClick={() => setSelectedId(contact.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${
                  isActive ? "bg-indigo-50 border-l-2 border-l-[#6366f1]" : "hover:bg-slate-50"
                }`}
              >
                <Avatar className="h-10 w-10 border border-slate-100 shrink-0">
                  <AvatarFallback className={`text-xs font-bold ${isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                    {contact.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-indigo-700" : "text-slate-700"}`}>
                    {contact.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate font-medium">
                    {contact.phone || "Sin teléfono"}
                  </p>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Right — Chat or empty state */}
      {selectedContact ? (
        <ChatPanel
          key={selectedId!}
          contactId={selectedId!}
          contactName={selectedContact.name}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Send className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium">Seleccioná un contacto</p>
          <p className="text-xs mt-1">para ver o iniciar una conversación de WhatsApp</p>
        </div>
      )}
    </div>
  );
}
