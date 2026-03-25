import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
    { title: "320", label: "Contactos totales", desc: "+12 esta semana", color: "text-emerald-600 bg-emerald-50" },
    { title: "87", label: "Leads activos", desc: "5 sin contactar +48hs", color: "text-amber-600 bg-amber-50" },
    { title: "142", label: "Mensajes enviados", desc: "Esta semana", color: "text-slate-400 bg-slate-50" },
    { title: "73%", label: "Tasa de respuesta", desc: "+5% vs semana pasada", color: "text-emerald-600 bg-emerald-50" },
];

const tareas = [
    { id: "t1", t: "Llamar a Ana Torres — cierre pendiente", s: "Venció ayer · Ana Torres", color: "text-red-500", completed: false },
    { id: "t2", t: "Enviar propuesta actualizada a Lucia Restrepo", s: "Hoy · Lucia Restrepo", color: "text-slate-400", completed: false },
    { id: "t3", t: "Agendar reunión con Carlos Mendoza", s: "Completada ayer", color: "text-slate-300", completed: true },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6 bg-slate-50/30 p-2">

            {/* 1. Métrica Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {stats.map((stat) => (
                    <Card key={stat.label} className="bg-white rounded-xl ">
                        <CardHeader className="pb-1 px-5">
                            <span className="text-3xl font-bold text-slate-900 tracking-tighter">{stat.title}</span>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        </CardHeader>
                        <CardContent className="px-5 pb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stat.color}`}>
                                {stat.desc}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 2. Gráfico y Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                <Card className="lg:col-span-7 border-slate-200 bg-white rounded-xl overflow-hidden">
                    <CardHeader className="px-5 py-2 border-b border-slate-50">
                        <CardTitle className="font-bold text-sm text-slate-700">Mensajes por día</CardTitle>
                    </CardHeader>
                    <CardContent className="h-52 flex items-end justify-between gap-3 px-8 pb-5 pt-3">
                        {[35, 65, 30, 85, 45, 20, 15].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div
                                    className="w-full rounded-md bg-[#6366f1]/20 group-hover:bg-[#6366f1] transition-all cursor-pointer relative"
                                    style={{ height: `${h * 1.5}px` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h}
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i]}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-5 border-slate-200 bg-white rounded-xl shadow-none overflow-hidden">
                    <CardHeader className="px-6 py-4 border-b border-slate-50">
                        <CardTitle className="font-bold text-sm text-slate-700">Funnel de contactos</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                        <div className="grid grid-cols-5 gap-2 text-center items-end">
                            {[
                                { n: 87, l: "Lead" },
                                { n: 45, l: "Negoc." },
                                { n: 156, l: "Activo" },
                                { n: 32, l: "Cerrado" },
                                { n: 32, l: "Perdido", c: "text-red-500" }
                            ].map((item) => (
                                <div key={item.l} className="space-y-2">
                                    <span className={`text-lg font-black tracking-tighter ${item.c || 'text-[#6366f1]'}`}>
                                        {item.n}
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{item.l}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Flujos automáticos</span>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-bold px-3 py-0.5 rounded-full">
                                2 ACTIVOS
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Tareas con formato unificado */}
            <Card className="bg-white border-slate-200 rounded-xl shadow-none">
                <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold text-slate-700">Tareas pendientes hoy</CardTitle>
                    <Button variant="ghost" className="h-7 text-[10px] font-bold px-3 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 uppercase tracking-tight transition-colors">
                        Ver todas
                    </Button>
                </CardHeader>
                <CardContent className="px-6 py-4 space-y-1">
                    {tareas.map((tarea) => (
                        <div
                            key={tarea.id}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50 last:border-0"
                        >
                            <Checkbox
                                id={tarea.id}
                                defaultChecked={tarea.completed}
                                className={`mt-0.5 border-slate-300 h-4 w-4 rounded transition-colors ${tarea.completed ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' : 'data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]'
                                    }`}
                            />
                            <div className="flex flex-col select-none">
                                <label
                                    htmlFor={tarea.id}
                                    className={`text-sm font-semibold tracking-tight cursor-pointer transition-colors ${tarea.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                        }`}
                                >
                                    {tarea.t}
                                </label>
                                <span className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${tarea.completed ? 'text-slate-300' : tarea.color
                                    }`}>
                                    {tarea.s}
                                </span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}