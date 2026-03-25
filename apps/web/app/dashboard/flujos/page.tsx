import React from 'react';
import { Plus, ChevronRight, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

const automationFlows = [
    {
        id: 1,
        title: "Seguimiento lead frío",
        config: "Etiqueta: seguimiento · Estado: lead · Sin respuesta +24hs",
        active: false,
        sentToday: "8 enviados hoy",
        steps: [
            { label: "TRIGGER", content: "Etiqueta \"seguimiento\" + 24hs sin respuesta", color: "bg-indigo-50/50 border-indigo-100 text-indigo-700" },
            { label: "ACCIÓN", content: "WhatsApp · saludo_inicial", color: "bg-blue-50/50 border-blue-100 text-blue-700" },
            { label: "ESPERA 48HS", content: "Si no responde...", color: "bg-slate-50 border-slate-100 text-slate-500" },
            { label: "FIN", content: "Cambiar a \"lost\" + tarea", color: "bg-green-50/50 border-green-100 text-green-700" }
        ]
    },
    {
        id: 2,
        title: "Reactivar propuesta",
        config: "Etiqueta: propuesta-enviada · Estado: negotiation · Sin respuesta +48hs",
        active: true,
        sentToday: "3 enviados hoy",
        steps: [
            { label: "TRIGGER", content: "Etiqueta \"propuesta-enviada\" + 48hs sin respuesta", color: "bg-indigo-50/50 border-indigo-100 text-indigo-700" },
            { label: "ACCIÓN", content: "WhatsApp · saludo_inicial", color: "bg-blue-50/50 border-blue-100 text-blue-700" },
            { label: "ESPERA 48HS", content: "Si no responde...", color: "bg-slate-50 border-slate-100 text-slate-500" },
            { label: "FIN", content: "Cambiar a \"lost\" + tarea", color: "bg-green-50/50 border-green-100 text-green-700" }
        ]
    }
];

export default function FlujosPage() {
    return (
        <div className="bg-slate-50 min-h-screen space-y-8">
            {/* Header Principal */}
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div>
                    <h2 className="text-sm font-bold text-slate-900">Flujos automáticos</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Se ejecutan solos basados en etiquetas y tiempo sin respuesta</p>
                </div>
                <Button className="h-9 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-xs font-bold px-5 shadow-lg shadow-indigo-100">
                    <Plus className="w-3.5 h-3.5 mr-2" /> Nuevo flujo
                </Button>
            </div>

            <div className="max-w-7xl mx-auto space-y-4">
                {automationFlows.map((flow) => (
                    <div key={flow.id} className="bg-slate-100 border border-slate-200 rounded-2xl p-2">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {/* Switch de Shadcn sin estado manual */}
                                <Switch defaultChecked={flow.active} className="data-[state=checked]:bg-green-500" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">{flow.title}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium">{flow.config}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${flow.active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {flow.active ? 'Activo' : 'Pausado'}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">{flow.sentToday}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Contenedor de Pasos */}
                        <div className="flex items-center gap-2  overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            {flow.steps.map((step, idx) => (
                                <React.Fragment key={idx}>
                                    <div className={`flex-1 min-w-[200px] max-w-[260px] p-4 rounded-xl border ${step.color}`}>
                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1.5">{step.label}</p>
                                        <p className="text-[11px] font-semibold leading-tight">{step.content}</p>
                                    </div>
                                    {idx < flow.steps.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Historial de ejecuciones */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8">
                    <h3 className="text-sm font-bold text-slate-800 mb-6 tracking-tight">Historial de ejecuciones hoy</h3>
                    <div className="space-y-1">
                        {[
                            { name: "Ana Torres", initial: "AT", log: "Flujo: Seguimiento lead frío · Paso 1 enviado", time: "Hace 2hs", dot: "bg-green-500" },
                            { name: "Lucia Restrepo", initial: "LR", log: "Respondió — salió del flujo automáticamente", time: "Hace 4hs", dot: "bg-orange-400" },
                            { name: "Jorge Pérez", initial: "JP", log: "Flujo completado sin respuesta → estado cambiado a lost", time: "Hace 5hs", dot: "bg-red-500" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                                <Avatar className="h-8 w-8 border border-slate-100">
                                    <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600">{item.initial}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{item.log}</p>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}