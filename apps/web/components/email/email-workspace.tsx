"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailModal } from "@/components/email/email-modal";
import { useContacts } from "@/hooks/use-contacts";

export function EmailWorkspace() {
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const { data: contacts = [], isLoading } = useContacts();

    // Encontrar datos del contacto activo
    const activeContact = contacts.find((c: any) => c.id === selectedContactId);

    return (
        <div className="flex h-[calc(100vh-60px)] overflow-hidden">
            {/* 1. SIDEBAR IZQUIERDO */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
                <div className="p-4 pt-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Buscar..." className="pl-9 h-10 bg-white border-slate-200 rounded-xl text-sm" />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {isLoading && <p className="p-4 text-xs text-slate-500">Cargando contactos...</p>}
                    {contacts.map((contact: any) => {
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

                        {/* Aquí iría el ScrollArea con los mensajes reales que cargaremos en la fase 2 */}
                        <div className="flex-1 p-8 text-center text-slate-400 text-xs bg-slate-50">
                            (Aquí dibujaremos el historial)
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
