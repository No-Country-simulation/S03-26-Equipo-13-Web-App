"use client";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import FlowSteps from "@/components/flows/flow-steps";

export default function FlowCard({ flow, onToggle }: any) {
  return (
    <div className="bg-slate-100 border rounded-2xl p-2">
      {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Switch
            checked={flow.active}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-green-500"
          />

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {flow.name}
            </h3>
           <p className="text-[11px] text-slate-400">
            Trigger: {flow.trigger}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              flow.active
                ? "bg-green-50 text-green-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {flow.active ? "Activo" : "Pausado"}
          </span>

          <span className="text-[11px] text-slate-400">
            {flow.executions?.length ?? 0} enviados hoy
          </span>

          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* STEPS */}
      <FlowSteps steps={flow.steps} />
    </div>
  );
}