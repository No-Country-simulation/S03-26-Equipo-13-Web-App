"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { Flow } from "@/lib/validators/flows";
import { useFlowBuilder } from "@/store/useFlowStore";

// ==============================
// GET FLOWS
// ==============================
export function useFlows() {
  return useQuery<Flow[]>({
    queryKey: ["flows"],
    queryFn: async () => {
      return fetchWithAuth(`${API_URL}/flows`);
    },
  });
}

// ==============================
// TOGGLE FLOW (activar/pausar)
// ==============================
export function useToggleFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      active,
    }: {
      id: string;
      active: boolean;
    }) => {
      return fetchWithAuth(`${API_URL}/flows/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    },
  });
}

// ==============================
// CREATE FLOW
// ==============================

export function useCreateFlow() {
  const queryClient = useQueryClient();
  const { steps, trigger } = useFlowBuilder.getState();

const payload = {
  name: "Nuevo flujo",
  trigger,
  steps: steps.map(({ id, ...rest }) => rest),
};
  return useMutation({
    mutationFn: async (data: {
      name: string;
      trigger: string;
      steps: any[];
    }) => {
      return fetchWithAuth(`${API_URL}/flows`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    },
  });
}

// ==============================
// EJECUTAR FLOW
// ==============================

/* export function useRunFlow() {
  return useMutation({
    mutationFn: async ({
      flowId,
      contactId,
    }: {
      flowId: string;
      contactId: string;
    }) => {
      return fetchWithAuth(`${API_URL}/flows/${flowId}/trigger`, {
        method: "POST",
        body: JSON.stringify({ contactId }),
      });
    },
  });
} */

  export const useRunFlow = () => {
  return useMutation({
    mutationFn: async ({
      flowId,
      contactId,
    }: {
      flowId: string;
      contactId: string;
    }) => {
      return fetchWithAuth(`${API_URL}/flows/${flowId}/trigger`, {
        method: "POST",
        body: JSON.stringify({ contactId }),
      });
    },
  });
};