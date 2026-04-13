"use client";

import { FlowStepType } from "@/lib/validators/flows";

const steps: { type: FlowStepType; label: string }[] = [
  { type: "send_whatsapp", label: "WhatsApp" },
  { type: "send_email", label: "Email" },
  { type: "wait", label: "Espera" },
  { type: "update_status", label: "Estado" },
  { type: "assign_tag", label: "Tag" },
];

export default function FlowSidebar() {
  return (
    <div className="w-64 bg-white border rounded-xl p-3 space-y-2">
      {steps.map((step) => (
        <div
          key={step.type}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("stepType", step.type);
          }}
          className="p-3 border rounded-lg cursor-grab hover:bg-slate-50"
        >
          {step.label}
        </div>
      ))}
    </div>
  );
}