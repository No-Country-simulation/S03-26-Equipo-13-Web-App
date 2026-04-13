import { FlowStep } from "@/lib/validators/flows";

export function buildFlowPayload({
  name,
  trigger,
  steps,
}: {
  name: string;
  trigger: string;
  steps: FlowStep[];
}) {
  return {
    name,
    trigger,
    steps: steps.map((step) => ({
      type: step.type,
      config: step.config ?? {},
    })),
  };
}