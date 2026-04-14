"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardSummary, useDashboardMessages } from "@/hooks/use-analytics";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:      { label: "Nuevos",    color: "text-[#6366f1]" },
  active:   { label: "Activos",   color: "text-emerald-600" },
  inactive: { label: "Inactivos", color: "text-amber-500" },
  archived: { label: "Archivados",color: "text-slate-400" },
};

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: msgStats = [], isLoading: loadingChart } = useDashboardMessages("7d");
  const { data: tasks = [], isLoading: loadingTasks } = useTasks({ status: "pending" });
  const updateTask = useUpdateTask();

  const pendingTasks = tasks.slice(0, 5);

  const maxMessages = Math.max(...msgStats.map(d => d.inbound + d.outbound), 1);

  const stats = [
    {
      title: loadingSummary ? "—" : String(summary?.totalContacts ?? 0),
      label: "Contactos totales",
      desc: loadingSummary ? "Cargando..." : `+${summary?.newContactsThisWeek ?? 0} esta semana`,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: loadingSummary ? "—" : String(summary?.activeContacts ?? 0),
      label: "Contactos activos",
      desc: loadingSummary ? "Cargando..." : `de ${summary?.totalContacts ?? 0} totales`,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: loadingSummary ? "—" : String(summary?.messagesThisWeek ?? 0),
      label: "Mensajes esta semana",
      desc: loadingSummary ? "Cargando..." : `${summary?.totalMessages ?? 0} en total`,
      color: "text-slate-500 bg-slate-50",
    },
    {
      title: loadingSummary ? "—" : (summary?.responseRate ?? "0%"),
      label: "Tasa de respuesta",
      desc: loadingSummary ? "Cargando..." : `${summary?.inboundMessages ?? 0} recibidos`,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  const funnelEntries = Object.entries(STATUS_LABELS).map(([key, meta]) => ({
    key,
    label: meta.label,
    color: meta.color,
    count: summary?.funnel?.[key] ?? 0,
  }));

  return (
    <div className="space-y-6 bg-slate-50/30 p-2">

      {/* 1. Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white rounded-xl">
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

        {/* Gráfico de mensajes por día */}
        <Card className="lg:col-span-7 border-slate-200 bg-white rounded-xl overflow-hidden">
          <CardHeader className="px-5 py-2 border-b border-slate-50">
            <CardTitle className="font-bold text-sm text-slate-700">Mensajes últimos 7 días</CardTitle>
          </CardHeader>
          <CardContent className="h-52 flex items-end justify-between gap-3 px-8 pb-5 pt-3">
            {loadingChart
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full rounded-md bg-slate-100 animate-pulse" style={{ height: "60px" }} />
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">···</span>
                  </div>
                ))
              : msgStats.map((day, i) => {
                  const total = day.inbound + day.outbound;
                  const heightPx = Math.max((total / maxMessages) * 140, total > 0 ? 8 : 4);
                  const d = new Date(day.date + "T12:00:00");
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-3 group">
                      <div
                        className="w-full rounded-md bg-[#6366f1]/20 group-hover:bg-[#6366f1] transition-all cursor-pointer relative"
                        style={{ height: `${heightPx}px` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {total} msg
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        {DAY_LABELS[d.getDay()]}
                      </span>
                    </div>
                  );
                })}
          </CardContent>
        </Card>

        {/* Funnel de contactos */}
        <Card className="lg:col-span-5 border-slate-200 bg-white rounded-xl shadow-none overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-50">
            <CardTitle className="font-bold text-sm text-slate-700">Estado de contactos</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-6">
            {loadingSummary ? (
              <div className="grid grid-cols-4 gap-2 text-center items-end">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-6 w-12 mx-auto rounded bg-slate-100 animate-pulse" />
                    <div className="h-3 w-14 mx-auto rounded bg-slate-100 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-center items-end">
                {funnelEntries.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <span className={`text-lg font-black tracking-tighter ${item.color}`}>
                      {item.count}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tareas pendientes</span>
              <Badge className="bg-amber-50 text-amber-600 border-none text-[10px] font-bold px-3 py-0.5 rounded-full">
                {loadingSummary ? "—" : `${summary?.pendingTasks ?? 0} ACTIVAS`}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Tareas pendientes reales */}
      <Card className="bg-white border-slate-200 rounded-xl shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-50">
          <CardTitle className="text-sm font-bold text-slate-700">Tareas pendientes</CardTitle>
          <Link href="/dashboard/tareas">
            <Button variant="ghost" className="h-7 text-[10px] font-bold px-3 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 uppercase tracking-tight transition-colors">
              Ver todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="px-6 py-4 space-y-1">
          {loadingTasks ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5">
                <div className="h-4 w-4 rounded bg-slate-100 animate-pulse mt-0.5 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-3/4 rounded bg-slate-100 animate-pulse" />
                  <div className="h-2.5 w-1/3 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))
          ) : pendingTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No hay tareas pendientes</p>
          ) : (
            pendingTasks.map((tarea) => {
              const overdue = tarea.dueDate && new Date(tarea.dueDate) < new Date();
              const dueDateStr = tarea.dueDate
                ? new Date(tarea.dueDate).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })
                : null;

              return (
                <div
                  key={tarea.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <Checkbox
                    id={tarea.id}
                    checked={tarea.status === "done"}
                    onCheckedChange={() =>
                      updateTask.mutate({ id: tarea.id, data: { done: tarea.status !== "done" } })
                    }
                    className="mt-0.5 border-slate-300 h-4 w-4 rounded data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div className="flex flex-col select-none">
                    <label htmlFor={tarea.id} className="text-sm font-semibold text-slate-700 tracking-tight cursor-pointer">
                      {tarea.title}
                    </label>
                    <span className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${overdue ? "text-red-500" : "text-slate-400"}`}>
                      {tarea.contact?.name && `${tarea.contact.name} · `}
                      {dueDateStr
                        ? overdue
                          ? `Venció el ${dueDateStr}`
                          : `Vence ${dueDateStr}`
                        : "Sin fecha"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
