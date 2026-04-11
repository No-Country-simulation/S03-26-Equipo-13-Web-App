"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

// Deterministic color from tag name so colors are consistent without DB storage
const COLORS = [
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-green-50 text-green-700 border-green-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-red-50 text-red-700 border-red-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-pink-50 text-pink-700 border-pink-200",
  "bg-teal-50 text-teal-700 border-teal-200",
];

export function tagColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => fetchWithAuth(`${API_URL}/contacts/tags`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      fetchWithAuth(`${API_URL}/contacts/tags`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`${API_URL}/contacts/tags/${id}`, { method: "DELETE" }).catch(() => null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
