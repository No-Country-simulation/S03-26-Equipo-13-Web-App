"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface Message {
  id: string;
  content: string;
  direction: "inbound" | "outbound";
  channel: string;
  status: "sent" | "delivered" | "read" | "failed";
  wamid: string | null;
  contactId: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface SendWhatsappPayload {
  contactId: string;
  content?: string;
  templateName?: string;
  templateVariables?: string[];
}

export function useMessages(contactId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["messages", contactId],
    queryFn: () => fetchWithAuth(`${API_URL}/messages?contactId=${contactId}`),
    enabled: !!contactId,
    staleTime: 0,
  });
}

export function useTemplates() {
  return useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: () => fetchWithAuth(`${API_URL}/templates`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSendWhatsapp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendWhatsappPayload) =>
      fetchWithAuth(`${API_URL}/messages/whatsapp`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.contactId] });
    },
  });
}
