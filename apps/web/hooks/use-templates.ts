"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;      // marketing | utility | authentication
  metaStatus: string;    // pending | approved | rejected
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplatePayload {
  name: string;
  content: string;
  category: string;
}

export function useTemplates() {
  return useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: () => fetchWithAuth(`${API_URL}/templates`),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      fetchWithAuth(`${API_URL}/templates`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`${API_URL}/templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
