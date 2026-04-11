"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Mail, MailOpen } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailModal } from "@/components/email/email-modal";
import { useContacts } from "@/hooks/use-contacts";
import { useEmailHistory } from "@/hooks/use-email";

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function EmailHistory({ contactId }: { contactId: string }) {
    const { data: emails = [], isLoading } = useEmailHistory(contactId);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [emails]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
            </div>
        );
    }

    if (emails.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <Mail className="h-10 w-10 mb-3 text-slate-200" />
                <p className="text-sm font-medium">Sin correos todavía</p>
                <p className="text-xs mt-1">Envía el primer email con el botón de arriba</p>
            </div>
        );
    }

    // Group by date
    const groups: Record<string, typeof emails> = {};
    [...emails].reverse().forEach((e) => {
        const dateKey = formatDate(e.createdAt);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(e);
    });

    return (
        <div className="space-y-6 pb-4">
            {Object.entries(groups).map(([date, msgs]) => (
                <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{date}</span>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    <div className="space-y-3">
                        {msgs.map((email) => {
                            const isOut = email.direction === "outbound";
                            return (
                                <div key={email.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] rounded-2xl border shadow-sm overflow-hidden ${isOut ? "rounded-br-none border-indigo-100 bg-indigo-50" : "rounded-bl-none border-slate-100 bg-white"}`}>
                                        {email.subject && (
                                            <div className={`px-4 pt-3 pb-1.5 border-b ${isOut ? "border-indigo-100" : "border-slate-100"}`}>
                                                <p className={`text-[11px] font-bold flex items-center gap-1.5 ${isOut ? "text-indigo-700" : "text-slate-600"}`}>
                                                    {isOut ? <MailOpen className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                                                    {email.subject}
                                                </p>
                                            </div>
                                        )}
                                        <div className="px-4 py-3">
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
                                               dangerouslySetInnerHTML={{ __html: email.content }} />
                                            <p className={`text-[9px] mt-1.5 text-right ${isOut ? "text-indigo-400" : "text-slate-400"}`}>
                                                {formatTime(email.createdAt)} · {isOut ? "Enviado" : "Recibido"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}

export function EmailWorkspace() {
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const { data: contacts = [], isLoading } = useContacts();

    // Encontrar datos del contacto activo
    const activeContact = contacts.find((c: any) => c.id === selectedContactId);

    const filtered = contacts.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex h-[calc(100vh-60px)] overflow-hidden">
            {/* 1. SIDEBAR IZQUIERDO */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
                <div className="p-4 pt-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar..."
                            className="pl-9 h-10 bg-white border-slate-200 rounded-xl text-sm"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {isLoading && <p className="p-4 text-xs text-slate-500">Cargando contactos...</p>}
                    {filtered.map((contact: any) => {
                        const isSelected = contact.id === selectedContactId;
                        return (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContactId(contact.id)}
                                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${isSelected ? 'bg-slate-200 border-y border-slate-50' : 'hover:bg-slate-100/30'}`}
                            >
                                <div className="shrink-0">
                                    <Avatar className="h-11 w-11 border border-slate-100">
                                        <AvatarFallback className="text-indigo-600 text-xs font-bold bg-indigo-50">
                                            {contact.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{contact.name}</p>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{contact.email || "Sin email"}</p>
                                </div>
                            </div>
                        )
                    })}
                </ScrollArea>
            </div>

            {/* 2. PANEL CENTRAL (ESPACIO DE TRABAJO) */}
            <div className="flex-1 flex flex-col bg-white relative">
                {!activeContact ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">
                        Selecciona un contacto para visualizar los correos.
                    </div>
                ) : (
                    <>
                        <div className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="text-indigo-600 text-[10px] bg-indigo-50">
                                        {activeContact.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{activeContact.name}</p>
                                    <p className="text-[11px] text-indigo-500">{activeContact.email || "No tiene email registrado"}</p>
                                </div>
                            </div>

                            {activeContact.email ? (
                                <EmailModal contactId={activeContact.id} />
                            ) : (
                                <p className="text-[10px] text-slate-400">🚨 Asignale un email primero</p>
                            )}
                        </div>

                        <ScrollArea className="flex-1 px-6 py-4">
                            <EmailHistory contactId={activeContact.id} />
                        </ScrollArea>
                    </>
                )}
            </div>
        </div>
    );
}
