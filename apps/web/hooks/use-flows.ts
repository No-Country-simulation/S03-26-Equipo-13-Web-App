"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface FlowStep {
  type: string;
  config?: Record<string, any>;
}

export interface FlowExecution {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  contactId: string;
}

export interface Flow {
  id: string;
  name: string;
  trigger: string;
  active: boolean;
  steps: FlowStep[];
  executions: FlowExecution[];
  createdAt: string;
}

export interface CreateFlowPayload {
  name: string;
  trigger: string;
  steps: FlowStep[];
}

export function useFlows() {
  return useQuery<Flow[]>({
    queryKey: ["flows"],
    queryFn: () => fetchWithAuth(`${API_URL}/flows`),
    staleTime: 1000 * 60 * 1,
  });
}

export function useToggleFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      fetchWithAuth(`${API_URL}/flows/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    },
  });
}

export function useCreateFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFlowPayload) =>
      fetchWithAuth(`${API_URL}/flows`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    },
  });
}

export function useDeleteFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`${API_URL}/flows/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    },
  });
}
