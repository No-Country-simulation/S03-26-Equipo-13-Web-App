"use client";

import { useState } from "react";
import { useFlows, useToggleFlow } from "@/hooks/use-flows";
import FlowCard from "@/components/flows/flow-card";
import { Flow } from "@/lib/validators/flows";
import { Button } from "../ui/button";
import FlowBuilder from "./flow-builder";
import { useFlowBuilder } from "@/store/useFlowStore";

export default function FlowsList() {
  const { data: flows = [], isLoading } = useFlows();
  const toggleFlow = useToggleFlow();

  const [open, setOpen] = useState(false); 
  const resetBuilder = useFlowBuilder((s) => s.reset);
  
   const handleClose = () => {
    setOpen(false);
    resetBuilder(); 
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold">Flujos automáticos</h2>

        <Button onClick={() => setOpen(true)}>
          Nuevo flujo
        </Button>
      </div>

      {/* LISTADO */}
      {flows.map((flow: Flow) => (
        <FlowCard
          key={flow.id}
          flow={flow}
          onToggle={(value: boolean) =>
            toggleFlow.mutate({
              id: flow.id,
              active: value,
            })
          }
        />
      ))}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[900px] h-[600px] rounded-xl p-4 relative">
            
            {/* BOTÓN CERRAR */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-sm"
            >
              ✕
            </button>

            <FlowBuilder />
          </div>
        </div>
      )}
    </div>
  );
}