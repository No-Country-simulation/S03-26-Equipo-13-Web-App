"use client";

import { useState } from 'react';
import { Plus, Check, Clock3, Edit3, XOctagon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTemplates, useCreateTemplate } from "@/hooks/use-templates";

// ── Status helpers ─────────────────────────────────────────────────────────────
type TemplateStatus = "approved" | "pending" | "rejected" | string;

function resolveStatus(category: string): TemplateStatus {
  const lower = category?.toLowerCase();
  if (lower === "approved") return "approved";
  if (lower === "rejected") return "rejected";
  return "pending"; // 'pending' or unknown category
}

const STATUS_LABEL: Record<string, string> = {
  approved: "Aprobada",
  pending: "En revisión",
  rejected: "Rechazada",
};

const STATUS_BAR: Record<string, string> = {
  approved: "bg-green-500",
  pending: "bg-orange-400",
  rejected: "bg-red-500",
};

const STATUS_BADGE: Record<string, string> = {
  approved: "bg-green-100/60 text-green-800",
  pending: "bg-orange-100/60 text-orange-800",
  rejected: "bg-red-100/60 text-red-800",
};

// ── Filter tabs ─────────────────────────────────────────────────────────────────
const TABS = ["Todas", "Aprobadas", "En revisión", "Rechazadas"] as const;
type Tab = typeof TABS[number];

const TAB_STATUS: Record<Tab, TemplateStatus | null> = {
  "Todas": null,
  "Aprobadas": "approved",
  "En revisión": "pending",
  "Rechazadas": "rejected",
};

// ── Create Template Modal ───────────────────────────────────────────────────────
function NewTemplateModal() {
  const { mutate: createTemplate, isPending } = useCreateTemplate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("MARKETING");

  const handleCreate = () => {
    if (!name.trim() || !content.trim()) return;
    createTemplate(
      { name: name.trim(), content: content.trim(), category },
      {
        onSuccess: () => {
          setName("");
          setContent("");
          setCategory("MARKETING");
          setOpen(false);
        },
        onError: (e) => alert("Error al crear: " + e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] gap-2 text-xs font-bold px-5 shadow-lg shadow-indigo-100/70">
          <Plus className="w-3.5 h-3.5" /> Nueva plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Crear plantilla de WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre (solo letras, números y _)</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. saludo_inicial"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white text-slate-700"
            >
              <option value="MARKETING">MARKETING</option>
              <option value="UTILITY">UTILITY</option>
              <option value="AUTHENTICATION">AUTHENTICATION</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Contenido</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hola {{1}}, te escribimos para..."
              className="min-h-[120px] text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">Usá {`{{1}}`}, {`{{2}}`}, etc. para variables</p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isPending || !name.trim() || !content.trim()}
            className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white"
          >
            {isPending ? "Enviando a Meta..." : "Crear y enviar a revisión"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PlantillasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Todas");
  const { data: templates = [], isLoading } = useTemplates();

  const filtered = templates.filter((t) => {
    const statusFilter = TAB_STATUS[activeTab];
    if (!statusFilter) return true;
    return resolveStatus(t.category) === statusFilter;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-full border border-slate-200">
          {TABS.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={`h-7 px-4 text-[11px] rounded-full transition-all ${
                activeTab === tab
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>

        <NewTemplateModal />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-sm font-medium">Sin plantillas</p>
          <p className="text-xs mt-1">Creá tu primera plantilla con el botón de arriba</p>
        </div>
      )}

      {/* Template cards */}
      <div className="space-y-4 max-w-6xl">
        {filtered.map((tpl) => {
          const status = resolveStatus(tpl.category);
          const label = STATUS_LABEL[status] ?? "En revisión";
          const barColor = STATUS_BAR[status] ?? "bg-orange-400";

          return (
            <div
              key={tpl.id}
              className="relative flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-1.5 shrink-0 ${barColor}`} />

              <div className="flex-1 p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="font-mono font-bold text-slate-800 text-[13px] tracking-tight bg-slate-100 px-2 py-0.5 rounded">
                    {tpl.name}
                  </h3>
                  <div className="flex items-center gap-2.5">
                    <StatusBadgeTemplate status={label} />
                    <Button
                      variant="outline"
                      disabled={status !== "approved"}
                      className={`h-7 rounded-lg text-[10px] font-bold px-3 gap-1.5 border-slate-200 ${
                        status === "approved"
                          ? 'text-green-700 hover:bg-green-50 hover:border-green-100'
                          : 'text-slate-400'
                      }`}
                    >
                      <ActionButtonIcon status={status} />
                      {status === "rejected" ? "Editar y reenviar" : status === "pending" ? "Pendiente" : "Usar"}
                    </Button>
                  </div>
                </div>

                {/* Body */}
                <div className="border border-slate-100 rounded-lg p-4 mb-3.5 bg-slate-50/50">
                  <p className="text-[12px] text-slate-500 leading-relaxed font-normal">
                    {tpl.content}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[8px] px-2 py-0.5 tracking-wider rounded-md hover:bg-slate-100">
                    WHATSAPP
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[8px] px-2 py-0.5 tracking-wider rounded-md hover:bg-slate-100">
                    ES
                  </Badge>
                </div>

                {/* Rejection reason */}
                {status === "rejected" && (
                  <div className="mt-4 bg-red-50/50 border border-red-100 p-3 rounded-lg flex items-start gap-2.5">
                    <XOctagon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-red-500 font-medium leading-normal">
                      Meta rechazó esta plantilla. Editá el contenido y reenvíala.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${styles[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function ActionButtonIcon({ status }: { status: string }) {
  if (status === "approved") return <Check className="w-3.5 h-3.5" />;
  if (status === "pending") return <Clock3 className="w-3.5 h-3.5" />;
  return <Edit3 className="w-3.5 h-3.5" />;
}
