
import { MessageCircle, Mail, X, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ConfiguracionPage() {
    return (
        <div className="bg-slate-50 min-h-screen space-y-6 max-w-6xl mx-auto">

            {/* 1. Canales Conectados */}
            <div className="bg-white border  rounded-2xl p-4 ">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Canales conectados</h3>
                <div className="space-y-4">
                    {/* WhatsApp */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 tabular-nums">+57 300 123 4567</span>
                            <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px] px-3 py-0.5 rounded-full">
                                Conectado
                            </Badge>
                        </div>
                    </div>
                    {/* Correo */}
                    <div className="flex items-center justify-between border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-slate-700">Correo</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500">usuario@gmail.com</span>
                            <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] px-3 py-0.5 rounded-full">
                                Conectado
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Etiquetas */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Etiquetas</h3>

                <div className="flex flex-wrap gap-2 mb-3">
                    <TagBadge label="seguimiento" color="bg-indigo-50 text-indigo-600" />
                    <TagBadge label="vip" color="bg-orange-50 text-orange-600" />
                    <TagBadge label="propuesta-enviada" color="bg-blue-50 text-blue-600" />
                    <TagBadge label="lead-frio" color="bg-red-50 text-red-600" />
                </div>

                <div className="flex gap-3">
                    <Input
                        placeholder="Nombre de etiqueta..."
                        className="flex-1 bg-slate-50/50 border-slate-200 rounded-xl h-10 text-sm shadow-none"
                    />
                    <Select defaultValue="rojo">
                        <SelectTrigger className="w-32 bg-slate-50/50 border-slate-200 rounded-xl h-10 text-sm">
                            <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rojo">Rojo</SelectItem>
                            <SelectItem value="azul">Azul</SelectItem>
                            <SelectItem value="verde">Verde</SelectItem>
                            <SelectItem value="naranja">Naranja</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="bg-[#6366f1] hover:bg-[#5558e3] rounded-xl px-6 h-10 text-xs font-bold">
                        Crear
                    </Button>
                </div>
            </div>

            {/* 3. Vistas Guardadas */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Vistas guardadas</h3>
                <div className="space-y-3">
                    <SavedViewRow label="Leads sin contactar +3 días" count="3 contactos" color="bg-orange-50 text-orange-600" />
                    <SavedViewRow label="Clientes en negociación activa" count="12 contactos" color="bg-blue-50 text-blue-600" />
                    <SavedViewRow label="VIP sin seguimiento semanal" count="5 contactos" color="bg-indigo-50 text-indigo-600" />
                </div>
            </div>
        </div>
    );
}

function TagBadge({ label, color }: { label: string, color: string }) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${color}`}>
            {label}
            <X className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100" />
        </div>
    );
}

function SavedViewRow({ label, count, color }: { label: string, count: string, color: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <Badge className={`${color} border-none font-bold text-[10px] px-3 py-0.5 rounded-full`}>
                {count}
            </Badge>
        </div>
    );
}