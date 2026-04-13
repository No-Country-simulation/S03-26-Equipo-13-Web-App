"use client";

import { FlowStepType } from "@/lib/validators/flows";
import FlowStepNode from "@/components/flows/flow-step-node";
import { useFlowBuilder } from "@/store/useFlowStore";

export default function FlowCanvas() {
  const steps = useFlowBuilder((s) => s.steps);
  const addStep = useFlowBuilder((s) => s.addStep);

  const isValidStepType = (value: string): value is FlowStepType => {
    return [
      "send_whatsapp",
      "send_email",
      "wait",
      "update_status",
      "assign_tag",
    ].includes(value);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const rawType = e.dataTransfer.getData("stepType");

    if (!isValidStepType(rawType)) {
      console.error("Tipo inválido:", rawType);
      return;
    }

    addStep(rawType);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className=" flex-1 
      bg-slate-50 
      border 
      rounded-xl 
      p-4 
      h-full 
      overflow-y-auto"
    >
      {steps.length === 0 && (
        <p className="text-sm text-slate-400">
          Arrastrá pasos acá 👇
        </p>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <FlowStepNode key={step.id} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}