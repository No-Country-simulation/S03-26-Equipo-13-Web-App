
import { Search, Send } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const chatList = [
    { id: 1, name: "Ana Torres", lastMsg: "¿Cuándo podemos hablar?", initial: "AT", unread: true },
    { id: 2, name: "Carlos Mendoza", lastMsg: "Gracias por la propuesta", initial: "CM", unread: false },
    { id: 3, name: "Lucia Restrepo", lastMsg: "Revisé el contrato y...", initial: "LR", unread: true },
    { id: 4, name: "Jorge Pérez", lastMsg: "Perfecto, confirmado", initial: "JP", unread: false },
];

export default function WhatsappPage() {
    return (
        <div className="flex h-screen overflow-hidden">
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
                    {chatList.map((chat) => (
                        <div
                            key={chat.id}
                            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${chat.id === 1 ? 'bg-slate-200 border-y border-slate-50' : 'hover:bg-slate-100/30'}`}
                        >
                            <div className="relative shrink-0">
                                <Avatar className="h-11 w-11 border border-slate-100">
                                    <AvatarFallback className="text-indigo-600 text-xs font-bold bg-indigo-50">
                                        {chat.initial}
                                    </AvatarFallback>
                                </Avatar>
                                {chat.unread && (
                                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{chat.name}</p>
                                    <span className="text-[10px] text-slate-400">9:15 am</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{chat.lastMsg}</p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Ventana de Chat Activo */}
            <div className="flex-1 flex flex-col bg-white">

                <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-200">
                            <AvatarFallback className="text-indigo-600 text-xs font-bold bg-indigo-50 text-[10px]">AT</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">Ana Torres</p>
                            <p className="text-[10px] text-green-500 font-medium mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                WhatsApp · activo ahora
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="h-8 rounded-full text-[11px] border-slate-200 text-slate-600 px-4">
                        Envío masivo
                    </Button>
                </div>

                {/* Área de Mensajes */}
                <div className="flex-1 p-6 space-y-8 overflow-y-auto bg-slate-50">
                    <div className="flex items-center gap-4 ">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Plantillas:</span>
                        <div className="flex gap-2">
                            <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-normal text-[11px] px-3 py-1 hover:bg-slate-50 transition-colors shadow-sm">
                                saludo_inicial
                            </Badge>
                            <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-normal text-[11px] px-3 py-1 hover:bg-slate-50 transition-colors shadow-sm">
                                seguimiento_propuesta
                            </Badge>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <span className="bg-slate-200 text-slate-500 text-[10px] px-3 py-0.5 rounded-full font-bold">HOY</span>
                    </div>

                    {/* Mensaje Recibido */}
                    <div className="flex flex-col gap-1.5 max-w-[70%]">
                        <div className="flex items-end gap-2">
                            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm relative group">
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    Hola, ¿cuándo podemos hablar para cerrar?
                                </p>
                                <span className="text-[9px] text-slate-400 absolute -bottom-5 left-0">9:15 am</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Input */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-2 max-w-5xl mx-auto relative">
                        <Input
                            placeholder="Escribir mensaje..."
                            className="flex-1 h-12 bg-slate-50/50 border-slate-200 rounded-2xl text-sm shadow-none focus-visible:ring-1 pr-12"
                        />
                        <Button className="absolute right-1 h-10 w-10 p-0 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] shadow-lg shadow-indigo-100">
                            <Send className="w-4 h-4 text-white" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}