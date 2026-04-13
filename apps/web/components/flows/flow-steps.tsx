"use client";

import { ChevronRight } from "lucide-react";
import { FlowStep, stepStyles } from "@/lib/validators/flows";

type Props = {
  steps: FlowStep[];
};

export default function FlowSteps({ steps }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step: FlowStep, idx: number) => (
        <div key={idx} className="flex items-center">
          <div
            className={`flex-1 min-w-[200px] max-w-[260px] p-4 rounded-xl border ${
              stepStyles[step.type]
            }`}
          >
            <p className="text-[9px] font-bold uppercase opacity-70 mb-1.5">
              {step.type}
            </p>
            <p className="text-[11px] font-semibold">
              {step.config?.content ||
                step.config?.status ||
                "Configuración"}
            </p>
          </div>

          {idx < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}