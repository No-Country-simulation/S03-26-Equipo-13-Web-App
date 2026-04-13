"use client";

import { FlowStep } from "@/lib/validators/flows";
import { useFlowBuilder } from "@/store/useFlowStore";

export default function FlowStepNode({
  step,
  index,
}: {
  step: FlowStep;
  index: number;
}) {
  const removeStep = useFlowBuilder((s) => s.removeStep);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm relative group">
      
      {/* BOTÓN DELETE */}
      <button
        onClick={() => removeStep(step.id)}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
      >
        ✕
      </button>

      <p className="text-xs text-slate-400 mb-1">
        Paso {index + 1}
      </p>

      <p className="font-bold text-sm mb-2">{step.type}</p>

      {/* CONFIG DINÁMICA */}
      {step.type === "send_whatsapp" && (
        <input
          placeholder="Mensaje..."
          className="w-full border rounded p-2 text-sm"
        />
      )}

      {step.type === "wait" && (
        <input
          placeholder="Delay ms (ej: 60000)"
          className="w-full border rounded p-2 text-sm"
        />
      )}

      {step.type === "update_status" && (
        <input
          placeholder="Nuevo estado"
          className="w-full border rounded p-2 text-sm"
        />
      )}
    </div>
  );
}