
import { Plus, Check, Clock3, Edit3, XOctagon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const templates = [
    {
        id: 1,
        name: "saludo_inicial",
        content: "Hola {{1}}, mi nombre es {{2}} del equipo {{3}}. ¿Puedo ayudarte con algo hoy?",
        status: "Aprobada",
        category: "MARKETING",
        language: "Español",
        barColor: "bg-green-500"
    },
    {
        id: 2,
        name: "seguimiento_propuesta",
        content: "Hola {{1}}, te escribo para hacer seguimiento a la propuesta del {{2}}. ¿La revisaste?",
        status: "Aprobada",
        category: "MARKETING",
        language: "Español",
        barColor: "bg-green-500"
    },
    {
        id: 3,
        name: "oferta_especial",
        content: "Hola {{1}}, tenemos una oferta especial de {{2}}% hasta el {{3}}.",
        status: "En revisión",
        category: "MARKETING",
        language: "Español",
        barColor: "bg-orange-400"
    },
    {
        id: 4,
        name: "descuento_urgente",
        content: "¡OFERTA URGENTE! Compra HOY con 50% descuento. Solo hoy.",
        status: "Rechazada",
        category: "MARKETING",
        language: "Español",
        barColor: "bg-red-500",
        reason: "Motivo: lenguaje agresivo y URL no verificada. Evita palabras en mayúsculas y links externos."
    }
];

export default function PlantillasPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header de Filtros */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-full border border-slate-200">
                    {['Todas', 'Aprobadas', 'En revisión', 'Rechazadas'].map((tab, i) => (
                        <Button
                            key={tab}
                            variant="ghost"
                            className={`h-7 px-4 text-[11px] rounded-full transition-all ${i === 0
                                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50 font-semibold'
                                : 'text-slate-500 hover:text-slate-700 font-medium'}`}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                <Button className="h-9 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] gap-2 text-xs font-bold px-5 shadow-lg shadow-indigo-100/70">
                    <Plus className="w-3.5 h-3.5" /> Nueva plantilla
                </Button>
            </div>

            {/* Listado de Tarjetas */}
            <div className="space-y-4 max-w-6xl">
                {templates.map((tpl) => (

                    <div key={tpl.id} className="relative flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">


                        <div className={`w-1.5 shrink-0 ${tpl.barColor}`} />

                        <div className="flex-1 p-5">
                            {/* Encabezado */}
                            <div className="flex items-center justify-between mb-3.5">
                                <h3 className="font-mono font-bold text-slate-800 text-[13px] tracking-tight bg-slate-100 px-2 py-0.5 rounded">
                                    {tpl.name}
                                </h3>
                                <div className="flex items-center gap-2.5">
                                    <StatusBadgeTemplate status={tpl.status} />
                                    <Button
                                        variant="outline"
                                        disabled={tpl.status !== "Aprobada"}
                                        className={`h-7 rounded-lg text-[10px] font-bold px-3 gap-1.5 border-slate-200 ${tpl.status === "Aprobada" ? 'text-green-700 hover:bg-green-50 hover:border-green-100' : 'text-slate-400'
                                            }`}
                                    >
                                        <ActionButtonIcon status={tpl.status} />
                                        {tpl.status === "Rechazada" ? "Editar y reenviar" : tpl.status === "En revisión" ? "Pendiente" : "Enviar"}
                                    </Button>
                                </div>
                            </div>

                            {/* Cuerpo */}
                            <div className=" border border-slate-100 rounded-lg p-4 mb-3.5">
                                <p className="text-[12px] text-slate-500 leading-relaxed font-normal">
                                    {tpl.content}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-1.5">
                                <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[8px] px-2 py-0.5 tracking-wider rounded-md hover:bg-slate-100">
                                    {tpl.category}
                                </Badge>
                                <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[8px] px-2 py-0.5 tracking-wider rounded-md hover:bg-slate-100">
                                    {tpl.language}
                                </Badge>
                            </div>

                            {/* Motivo de Rechazo (si existe) */}
                            {tpl.reason && (
                                <div className="mt-4 bg-red-50/50 border border-red-100 p-3 rounded-lg flex items-start gap-2.5">
                                    <XOctagon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-red-500 font-medium leading-normal">
                                        {tpl.reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusBadgeTemplate({ status }: { status: string }) {
    const styles: Record<string, string> = {
        "Aprobada": "bg-green-100/60 text-green-800",
        "En revisión": "bg-orange-100/60 text-orange-800",
        "Rechazada": "bg-red-100/60 text-red-800",
    };
    return (
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
}

function ActionButtonIcon({ status }: { status: string }) {
    if (status === "Aprobada") return <Check className="w-3.5 h-3.5" />;
    if (status === "En revisión") return <Clock3 className="w-3.5 h-3.5" />;
    return <Edit3 className="w-3.5 h-3.5" />;
}