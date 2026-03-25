
import { Search, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const emailList = [
    { id: 1, name: "Ana Torres", lastMail: "Último correo hace 2 días", initial: "AT", unread: true },
    { id: 2, name: "Carlos Mendoza", lastMail: "Último correo hace 2 días", initial: "CM", unread: false },
    { id: 3, name: "Lucia Restrepo", lastMail: "Último correo hace 2 días", initial: "LR", unread: true },
    { id: 4, name: "Jorge Pérez", lastMail: "Último correo hace 2 días", initial: "JP", unread: false },
];

export default function EmailPage() {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar - Clon Idéntico al de WhatsApp */}
            <div className="w-80 border-r border-slate-100 flex flex-col">
                <div className="p-4 pt-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-9 h-10 bg-white border-slate-200 rounded-xl text-sm shadow-none"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {emailList.map((contact) => (
                        <div
                            key={contact.id}
                            /* Fondo slate-200 cuando está seleccionado e h-11 en avatar para ser idénticos */
                            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${contact.id === 1 ? 'bg-slate-200 border-y border-slate-50' : 'hover:bg-slate-100/30'
                                }`}
                        >
                            <div className="relative shrink-0">
                                <Avatar className="h-11 w-11 border border-slate-100">
                                    <AvatarFallback className="text-indigo-600 text-xs font-bold bg-indigo-50">
                                        {contact.initial}
                                    </AvatarFallback>
                                </Avatar>
                                {contact.unread && (
                                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{contact.name}</p>
                                    <span className="text-[10px] text-slate-400">Hace 2 d</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{contact.lastMail}</p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Ventana de Email Activo */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {/* Header de Email */}
                <div className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-200">
                            <AvatarFallback className="text-indigo-600 text-[10px] font-bold bg-indigo-50">AT</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">Ana Torres</p>
                            <p className="text-[11px] text-indigo-500 font-medium mt-1">ana@empresa.com</p>
                        </div>
                    </div>
                    <Button className="h-9 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-xs font-bold gap-2 px-5 shadow-lg shadow-indigo-100">
                        <Plus className="w-4 h-4" /> Nuevo email
                    </Button>
                </div>

                {/* Área de Hilo de Emails */}
                <ScrollArea className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto space-y-8 flex flex-col">

                        {/* Card de Email Enviado */}
                        <div className="self-end w-full max-w-lg">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-slate-800 text-sm">Propuesta comercial</h4>
                                    <span className="text-[10px] text-slate-400 font-medium">Hace 2 días</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                    Te envío nuestra propuesta actualizada.
                                </p>
                                <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border-none text-[10px] font-bold px-2.5 py-0.5">
                                    Enviado
                                </Badge>
                            </div>
                        </div>

                        {/* Card de Email Recibido */}
                        <div className="self-start w-full max-w-lg">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-slate-800 text-sm">Re: Propuesta</h4>
                                    <span className="text-[10px] text-slate-400 font-medium">Ayer</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                    Gracias, lo reviso.
                                </p>
                                <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] font-bold px-2.5 py-0.5">
                                    Recibido
                                </Badge>
                            </div>
                        </div>

                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}