"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const stats = [
    { title: "320", label: "Contactos totales", desc: "+12 esta semana", color: "text-emerald-500" },
    { title: "87", label: "Leads activos", desc: "5 sin contactar +48hs", color: "text-amber-500" },
    { title: "142", label: "Mensajes enviados", desc: "Esta semana", color: "text-slate-400" },
    { title: "73%", label: "Tasa de respuesta", desc: "+5% vs semana pasada", color: "text-emerald-500" },
];

const tareas = [
    { id: "t1", t: "Llamar a Ana Torres — cierre pendiente", s: "Venció ayer · Ana Torres", color: "text-red-500", completed: false },
    { id: "t2", t: "Enviar propuesta actualizada a Lucia Restrepo", s: "Hoy · Lucia Restrepo", color: "text-slate-400", completed: false },
    { id: "t3", t: "Agendar reunión con Carlos Mendoza", s: "Completada ayer", color: "text-slate-300", completed: true },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">

            {/* 1. Métrica Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="bg-white">
                        <CardHeader className="pb-1 px-4 pt-1">
                            <span className="text-3xl font-semibold text-slate-900 tracking-tighter">{stat.title}</span>
                            <p className="text-sm text-slate-400">{stat.label}</p>
                        </CardHeader>
                        <CardContent className="px-4 pb-1">
                            <p className={`text-[11px] font-bold uppercase tracking-wider ${stat.color}`}>
                                {stat.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 2. Gráfico y Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card className="lg:col-span-7 border-none bg-white">
                    <CardHeader className="px-6 pt-2">
                        <CardTitle className="font-semibold text-md">Mensajes por día</CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-end justify-between gap-2 px-8 pb-2">
                        {[35, 65, 30, 85, 45, 20, 15].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full rounded-sm opacity-40 hover:opacity-100 transition-all cursor-pointer"
                                    style={{ height: `${h * 1.4}px`, backgroundColor: 'rgb(var(--brand-primary))' }}
                                />
                                <span className="text-[9px] text-slate-300 font-bold uppercase">
                                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i]}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-5 border-none bg-white">
                    <CardHeader className="px-6 pt-2">
                        <CardTitle className="font-bold text-md">Funnel de contactos</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6">
                        <div className="grid grid-cols-5 gap-2 text-center space-y-2">
                            {[
                                { n: 87, l: "Lead" },
                                { n: 45, l: "Negoc." },
                                { n: 156, l: "Activo" },
                                { n: 32, l: "Cerrado" },
                                { n: 32, l: "Perdido", c: "text-red-500" }
                            ].map((item) => (
                                <div key={item.l} className="space-y-1">
                                    <span className={`text-xl font-bold ${item.c || ''}`} style={{ color: !item.c ? 'rgb(var(--brand-primary))' : undefined }}>
                                        {item.n}
                                    </span>
                                    <p className="text-sm text-slate-400">{item.l}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t-2 border-slate-50 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400  uppercase tracking-wider">Flujos automáticos activos</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">2 activos</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Tareas con Shadcn Checkbox */}
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between px-6 py-2">
                    <CardTitle className="text-md font-bold ">Tareas pendientes hoy</CardTitle>
                    <button className="text-[10px] font-bold px-4  bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors uppercase tracking-tight">
                        Ver todas
                    </button>
                </CardHeader>
                <CardContent className="px-6 pb-2 space-y-1">
                    {tareas.map((tarea) => (
                        <div
                            key={tarea.id}
                            className="flex items-start gap-2 p-2 rounded-xl hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        >
                            <Checkbox
                                id={tarea.id}
                                defaultChecked={tarea.completed}
                                className="mt-1 border-slate-300 data-[state=checked]:bg-[rgb(var(--brand-primary))] data-[state=checked]:border-[rgb(var(--brand-primary))]"
                            />
                            <div className="flex flex-col select-none">
                                <label
                                    htmlFor={tarea.id}
                                    className={`text-sm font-medium leading-none mb-1.5 cursor-pointer transition-colors ${tarea.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                        }`}
                                >
                                    {tarea.t}
                                </label>
                                <span className={`text-[10px] font-bold uppercase tracking-tight ${tarea.completed ? 'text-slate-300' : tarea.color}`}>
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
