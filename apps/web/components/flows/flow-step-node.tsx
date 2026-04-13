"use client";

import { FlowStep, stepLabels } from "@/lib/validators/flows";
import { useFlowBuilder } from "@/store/useFlowStore";

export default function FlowStepNode({
  step,
  index,
}: {
  step: FlowStep;
  index: number;
}) {
  const removeStep = useFlowBuilder((s) => s.removeStep);
  const updateStep = useFlowBuilder((s) => s.updateStep);

  // ============================
  // VALIDACIÓN
  // ============================
  const isInvalid =
    (step.type === "send_whatsapp" && !step.config?.content) ||
    (step.type === "send_email" &&
      (!step.config?.subject || !step.config?.content)) ||
    (step.type === "wait" && !step.config?.delayMs) ||
    (step.type === "update_status" && !step.config?.status) ||
    (step.type === "assign_tag" && !step.config?.tagName);

  return (
    <div
      className={`bg-white border rounded-xl p-4 shadow-sm relative group transition ${
        isInvalid ? "border-red-300" : "border-gray-200"
      }`}
    >
      {/* DELETE */}
      <button
        onClick={() => removeStep(step.id)}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
      >
        ✕
      </button>

      {/* HEADER */}
      <p className="text-xs text-slate-400 mb-1">Paso {index + 1}</p>

      <p className="font-bold text-sm mb-1">
        {stepLabels[step.type]}
      </p>

      {/* DESCRIPCIÓN */}
      <p className="text-xs text-slate-500 mb-3">
        {step.type === "send_whatsapp" && "Se enviará un mensaje por WhatsApp"}
        {step.type === "send_email" && "Se enviará un email al contacto"}
        {step.type === "wait" && "Se esperará un tiempo antes de continuar"}
        {step.type === "update_status" && "Se actualizará el estado del contacto"}
        {step.type === "assign_tag" && "Se asignará una etiqueta al contacto"}
      </p>

      {/* ============================
          CONFIG DINÁMICA
      ============================ */}

      {step.type === "send_whatsapp" && (
        <input
          placeholder="Escribí el mensaje de WhatsApp..."
          className="w-full border rounded p-2 text-sm"
          value={step.config?.content || ""}
          onChange={(e) =>
            updateStep(step.id, { content: e.target.value })
          }
        />
      )}

      {step.type === "send_email" && (
        <div className="flex flex-col gap-2">
          <input
            placeholder="Asunto del email"
            className="w-full border rounded p-2 text-sm"
            value={step.config?.subject || ""}
            onChange={(e) =>
              updateStep(step.id, { subject: e.target.value })
            }
          />
          <input
            placeholder="Contenido del email"
            className="w-full border rounded p-2 text-sm"
            value={step.config?.content || ""}
            onChange={(e) =>
              updateStep(step.id, { content: e.target.value })
            }
          />
        </div>
      )}

      {step.type === "wait" && (
        <input
          type="number"
          placeholder="Tiempo en ms (ej: 60000)"
          className="w-full border rounded p-2 text-sm"
          value={step.config?.delayMs || ""}
          onChange={(e) =>
            updateStep(step.id, {
              delayMs: Number(e.target.value),
            })
          }
        />
      )}

      {step.type === "update_status" && (
        <input
          placeholder="Nuevo estado (ej: pending, done)"
          className="w-full border rounded p-2 text-sm"
          value={step.config?.status || ""}
          onChange={(e) =>
            updateStep(step.id, { status: e.target.value })
          }
        />
      )}

      {step.type === "assign_tag" && (
        <input
          placeholder="Nombre de la etiqueta (ej: cliente_activo)"
          className="w-full border rounded p-2 text-sm"
          value={step.config?.tagName || ""}
          onChange={(e) =>
            updateStep(step.id, { tagName: e.target.value })
          }
        />
      )}
    </div>
  );
}