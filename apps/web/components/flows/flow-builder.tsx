/* "use client";

import FlowSidebar from "./flow-sidebar";
import FlowCanvas from "./flow-canvas";

export default function FlowBuilder() {
  return (
    <div className="flex gap-4 h-full">
      <FlowSidebar />
      <FlowCanvas />
    </div>
  );
} */

"use client";

import { useState } from "react";
import FlowSidebar from "./flow-sidebar";
import FlowCanvas from "./flow-canvas";
import { useFlowBuilder } from "@/store/useFlowStore";
import { useCreateFlow } from "@/hooks/use-flows";
import { buildFlowPayload } from "@/lib/adapters/flow-builder.adapter";

export default function FlowBuilder({ onClose }: { onClose: () => void }) {
    const steps = useFlowBuilder((s) => s.steps);
    const reset = useFlowBuilder((s) => s.reset);

    const [name, setName] = useState("");
    const [trigger, setTrigger] = useState("manual");

    const createFlow = useCreateFlow();

    const handleSave = async () => {
        const payload = buildFlowPayload({
            name,
            trigger,
            steps,
        });

        await createFlow.mutateAsync(payload);

        reset();
        onClose();
    };

    return (
        <div className="flex flex-col h-full gap-4">

            {/* HEADER */}
            <div className="flex gap-2">
                <input
                    placeholder="Nombre del flujo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded p-2 text-sm flex-1"
                />
                {/* escalable futuro select */}
                {/* <select
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="manual">Manual</option>
          <option value="contact_created">Nuevo contacto</option>
          <option value="status_changed">Cambio estado</option>
          <option value="tag_added">Tag agregado</option>
        </select> */}

                <select
                    value="manual"
                    disabled
                    className="border rounded p-2 text-sm bg-gray-100 cursor-not-allowed"
                >
                    <option value="manual">Manual</option>
                </select>

                <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white px-4 rounded"
                >
                    Guardar
                </button>
            </div>

            {/* BODY */}
            <div className="flex h-[80vh] min-h-[500px] overflow-hidden">
                <FlowSidebar />
                <FlowCanvas />
            </div>
        </div>
    );
}