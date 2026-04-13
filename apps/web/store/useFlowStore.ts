"use client";

import { create } from "zustand";
import { FlowStep, FlowStepType, FlowTrigger } from "@/lib/validators/flows";
import { v4 as uuid } from "uuid";

interface FlowBuilderState {
  steps: FlowStep[];
  trigger: FlowTrigger;

  addStep: (type: FlowStepType) => void;
  removeStep: (id: string) => void;
  updateStep: (id: string, config: Record<string, any>) => void;
  setSteps: (steps: FlowStep[]) => void;
  reset: () => void;
  setTrigger: (trigger: FlowTrigger) => void;

  // 🔥 NUEVO
  buildPayload: () => any[];
}
const createDefaultConfig = (type: FlowStepType) => {
  switch (type) {
    case "send_whatsapp":
      return { content: "" };

    case "send_email":
      return { subject: "", content: "" };

    case "wait":
      return { delayMs: 0 };

    case "assign_tag":
      return { tagName: "" };

    case "update_status":
      return { status: "pending" };

    default:
      return {};
  }
};

export const useFlowBuilder = create<FlowBuilderState>((set, get) => ({
  steps: [],
  trigger: "manual",

  addStep: (type) =>
    set((state) => ({
      steps: [
        ...state.steps,
        {
          id: uuid(),
          type,
          config: createDefaultConfig(type),
        } as FlowStep,
      ],
    })),

  removeStep: (id) =>
    set((state) => ({
      steps: state.steps.filter((s) => s.id !== id),
    })),

 /*  updateStep: (id, config) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === id
          ? { ...s, config: { ...s.config, ...config } }
          : s
      ),
    })), */
    updateStep: (id: string, config: Record<string, any>) =>
  set((state) => ({
    steps: state.steps.map((s) => {
      if (s.id !== id) return s;

      switch (s.type) {
        case "send_whatsapp":
          return {
            ...s,
            config: {
              ...s.config,
              ...config,
            },
          } as FlowStep;

        case "send_email":
          return {
            ...s,
            config: {
              ...s.config,
              ...config,
            },
          } as FlowStep;

        case "wait":
          return {
            ...s,
            config: {
              ...s.config,
              ...config,
            },
          } as FlowStep;

        case "assign_tag":
          return {
            ...s,
            config: {
              ...s.config,
              ...config,
            },
          } as FlowStep;

        case "update_status":
          return {
            ...s,
            config: {
              ...s.config,
              ...config,
            },
          } as FlowStep;

        default:
          return s;
      }
    }),
  })),

  setSteps: (steps) => set({ steps }),

  reset: () => set({ steps: [], trigger: "manual" }),

  setTrigger: (trigger) => set({ trigger }),


buildPayload: () => {
  const { steps } = get();

  return steps.map(({ id, ...step }) => step); 

},

}));