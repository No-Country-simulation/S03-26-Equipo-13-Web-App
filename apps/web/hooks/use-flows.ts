"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { Flow } from "@/lib/validators/flows";

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