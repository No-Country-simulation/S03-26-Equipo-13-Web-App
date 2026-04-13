"use client";

import { create } from "zustand";
import { FlowStep, FlowStepType } from "@/lib/validators/flows";
import { v4 as uuid } from "uuid";

interface FlowBuilderState {
  steps: FlowStep[];

  addStep: (type: FlowStepType) => void;
  removeStep: (id: string) => void;
  updateStep: (id: string, config: Record<string, any>) => void;
  setSteps: (steps: FlowStep[]) => void;
  reset: () => void;
}

export const useFlowBuilder = create<FlowBuilderState>((set) => ({
  steps: [],

  addStep: (type) =>
    set((state) => ({
      steps: [
        ...state.steps,
        {
          id: uuid(),
          type,
          config: {},
        },
      ],
    })),

  removeStep: (id) =>
    set((state) => ({
      steps: state.steps.filter((s) => s.id !== id),
    })),

  updateStep: (id, config) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === id ? { ...s, config } : s
      ),
    })),

  setSteps: (steps) => set({ steps }),

  reset: () => set({ steps: [] }),
}));