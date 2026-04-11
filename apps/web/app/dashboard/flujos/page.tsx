"use client";

import React, { useState } from 'react';
import { Plus, ChevronRight, Zap, Clock, GitBranch, Send, Tag, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFlows, useToggleFlow, useCreateFlow, Flow, FlowExecution, FlowStep } from "@/hooks/use-flows";

// ── Helpers ────────────────────────────────────────────────────────────────────
const TRIGGER_LABEL: Record<string, string> = {
  contact_created: "Contacto creado",
  status_changed: "Estado cambiado",
  tag_added: "Etiqueta agregada",
  manual: "Manual",
};

const STEP_LABEL: Record<string, string> = {
  send_whatsapp: "WhatsApp",
  send_email: "Email",
  wait: "Esperar",
  update_status: "Cambiar estado",
  assign_tag: "Agregar etiqueta",
};

const STEP_COLOR: Record<string, string> = {
  send_whatsapp: "bg-green-50/50 border-green-100 text-green-700",
  send_email: "bg-blue-50/50 border-blue-100 text-blue-700",
  wait: "bg-slate-50 border-slate-100 text-slate-500",
  update_status: "bg-orange-50/50 border-orange-100 text-orange-700",
  assign_tag: "bg-indigo-50/50 border-indigo-100 text-indigo-700",
};

const STEP_ICON: Record<string, React.ReactNode> = {
  send_whatsapp: <Send className="w-3 h-3" />,
  send_email: <Send className="w-3 h-3" />,
  wait: <Clock className="w-3 h-3" />,
  update_status: <RefreshCw className="w-3 h-3" />,
  assign_tag: <Tag className="w-3 h-3" />,
};

const EXEC_STATUS_DOT: Record<string, string> = {
  running: "bg-blue-400",
  completed: "bg-green-500",
  failed: "bg-red-500",
  cancelled: "bg-slate-300",
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h > 0) return `Hace ${h}hs`;
  if (m > 0) return `Hace ${m}min`;
  return "Hace un momento";
}

function stepDescription(step: { type: string; config?: Record<string, any> }) {
  const label = STEP_LABEL[step.type] ?? step.type;
  if (step.config?.templateName) return `${label} · ${step.config.templateName}`;
  if (step.config?.delayMs) return `${label} ${Math.round(step.config.delayMs / 3600000)}hs`;
  if (step.config?.status) return `${label}: ${step.config.status}`;
  if (step.config?.tag) return `${label}: ${step.config.tag}`;
  return label;
}

// ── Flow card ──────────────────────────────────────────────────────────────────
function FlowCard({ flow }: { flow: Flow }) {
  const { mutate: toggle, isPending } = useToggleFlow();

  const todayExecs = flow.executions.filter((e) => {
    const d = new Date(e.startedAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });

  return (
    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Switch
            checked={flow.active}
            disabled={isPending}
            onCheckedChange={(checked) => toggle({ id: flow.id, active: checked })}
            className="data-[state=checked]:bg-green-500"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{flow.name}</h3>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {TRIGGER_LABEL[flow.trigger] ?? flow.trigger}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${flow.active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
            {flow.active ? 'Activo' : 'Pausado'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {todayExecs.length} hoy
          </span>
        </div>
      </div>

      {/* Steps */}
      {flow.steps && flow.steps.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {flow.steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className={`flex-1 min-w-[180px] max-w-[240px] p-3.5 rounded-xl border ${STEP_COLOR[step.type] ?? "bg-slate-50 border-slate-100 text-slate-600"}`}>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1.5 flex items-center gap-1">
                  {STEP_ICON[step.type]}
                  {idx === 0 ? "TRIGGER" : `PASO ${idx}`}
                </p>
                <p className="text-[11px] font-semibold leading-tight">{stepDescription(step)}</p>
              </div>
              {idx < flow.steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic py-4 text-center">Sin pasos configurados</p>
      )}
    </div>
  );
}

// ── Execution history row ──────────────────────────────────────────────────────
function ExecRow({ exec, flowName }: { exec: FlowExecution; flowName: string }) {
  const initial = exec.contactId.slice(0, 2).toUpperCase();
  const dotColor = EXEC_STATUS_DOT[exec.status] ?? "bg-slate-300";
  const statusLabel: Record<string, string> = { running: "En proceso", completed: "Completado", failed: "Error", cancelled: "Cancelado" };

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <Avatar className="h-8 w-8 border border-slate-100">
        <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600">{initial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate font-mono text-xs">{exec.contactId}</p>
        <p className="text-[11px] text-slate-400 truncate">Flujo: {flowName} · {statusLabel[exec.status] ?? exec.status}</p>
      </div>
      <span className="text-[11px] text-slate-400 font-medium shrink-0">{formatRelative(exec.startedAt)}</span>
    </div>
  );
}

// ── Step types for the builder ────────────────────────────────────────────────
const STEP_TYPES = [
  { value: "send_whatsapp", label: "Enviar WhatsApp" },
  { value: "send_email",    label: "Enviar Email" },
  { value: "wait",          label: "Esperar (horas)" },
  { value: "update_status", label: "Cambiar estado" },
  { value: "assign_tag",    label: "Agregar etiqueta" },
];

const TRIGGER_OPTIONS = [
  { value: "contact_created", label: "Contacto creado" },
  { value: "status_changed",  label: "Estado cambiado" },
  { value: "tag_added",       label: "Etiqueta agregada" },
  { value: "manual",          label: "Manual" },
];

const STATUS_OPTIONS = ["new", "active", "inactive", "archived"];

function StepConfigFields({
  step,
  onChange,
}: {
  step: FlowStep;
  onChange: (config: Record<string, any>) => void;
}) {
  const cfg = step.config ?? {};
  if (step.type === "send_whatsapp") return (
    <Input
      placeholder="Nombre de plantilla aprobada"
      value={cfg.templateName ?? ""}
      onChange={(e) => onChange({ templateName: e.target.value })}
      className="text-xs h-8 mt-1"
    />
  );
  if (step.type === "send_email") return (
    <Input
      placeholder="Asunto del email"
      value={cfg.subject ?? ""}
      onChange={(e) => onChange({ subject: e.target.value })}
      className="text-xs h-8 mt-1"
    />
  );
  if (step.type === "wait") return (
    <Input
      type="number"
      min={1}
      placeholder="Horas de espera"
      value={cfg.delayMs ? cfg.delayMs / 3600000 : ""}
      onChange={(e) => onChange({ delayMs: Number(e.target.value) * 3600000 })}
      className="text-xs h-8 mt-1"
    />
  );
  if (step.type === "update_status") return (
    <select
      value={cfg.status ?? ""}
      onChange={(e) => onChange({ status: e.target.value })}
      className="w-full h-8 mt-1 rounded-md border border-slate-200 px-2 text-xs bg-white"
    >
      <option value="">Seleccionar estado</option>
      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
  if (step.type === "assign_tag") return (
    <Input
      placeholder="Nombre de la etiqueta"
      value={cfg.tag ?? ""}
      onChange={(e) => onChange({ tag: e.target.value })}
      className="text-xs h-8 mt-1"
    />
  );
  return null;
}

function NewFlowModal() {
  const { mutate: createFlow, isPending } = useCreateFlow();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("contact_created");
  const [steps, setSteps] = useState<FlowStep[]>([{ type: "send_whatsapp", config: {} }]);

  const addStep = () => setSteps([...steps, { type: "send_whatsapp", config: {} }]);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStepType = (i: number, type: string) =>
    setSteps(steps.map((s, idx) => idx === i ? { type, config: {} } : s));
  const updateStepConfig = (i: number, config: Record<string, any>) =>
    setSteps(steps.map((s, idx) => idx === i ? { ...s, config } : s));

  const handleCreate = () => {
    if (!name.trim() || steps.length === 0) return;
    createFlow(
      { name: name.trim(), trigger, steps },
      {
        onSuccess: () => {
          setName(""); setTrigger("contact_created");
          setSteps([{ type: "send_whatsapp", config: {} }]);
          setOpen(false);
        },
        onError: (e) => alert("Error: " + e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-xs font-bold px-5 shadow-lg shadow-indigo-100">
          <Plus className="w-3.5 h-3.5 mr-2" /> Nuevo flujo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear flujo automático</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre del flujo</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Bienvenida a nuevos leads" />
          </div>

          {/* Trigger */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Disparador (trigger)</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white"
            >
              {TRIGGER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500">Pasos</label>
              <button onClick={addStep} className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Agregar paso
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase w-10 shrink-0">
                      {i === 0 ? "INICIO" : `PASO ${i}`}
                    </span>
                    <select
                      value={step.type}
                      onChange={(e) => updateStepType(i, e.target.value)}
                      className="flex-1 h-8 rounded-md border border-slate-200 px-2 text-xs bg-white"
                    >
                      {STEP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(i)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <StepConfigFields step={step} onChange={(cfg) => updateStepConfig(i, cfg)} />
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={isPending || !name.trim()}
            className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white"
          >
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando...</> : "Crear flujo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function FlujosPage() {
  const { data: flows = [], isLoading } = useFlows();

  // Collect last 10 executions across all flows, sorted by date desc
  const recentExecs = flows
    .flatMap((f) => f.executions.map((e) => ({ ...e, flowName: f.name })))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 10);

  return (
    <div className="bg-slate-50 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Flujos automáticos</h2>
          <p className="text-[11px] text-slate-400 font-medium">Se ejecutan solos según el trigger configurado</p>
        </div>
        <NewFlowModal />
      </div>

      <div className="max-w-7xl mx-auto space-y-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && flows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-slate-200 rounded-2xl">
            <GitBranch className="h-10 w-10 mb-3 text-slate-200" />
            <p className="text-sm font-medium">Sin flujos todavía</p>
            <p className="text-xs mt-1">Crea tu primer flujo automático</p>
          </div>
        )}

        {/* Flow cards */}
        {flows.map((flow) => (
          <FlowCard key={flow.id} flow={flow} />
        ))}

        {/* Execution history */}
        {recentExecs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8">
            <h3 className="text-sm font-bold text-slate-800 mb-6 tracking-tight">Historial de ejecuciones recientes</h3>
            <div className="space-y-1">
              {recentExecs.map((exec) => (
                <ExecRow key={exec.id} exec={exec} flowName={exec.flowName} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
