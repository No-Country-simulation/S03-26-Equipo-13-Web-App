"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface ChannelSettings {
  // WhatsApp
  WHATSAPP_TOKEN: string | null;
  WHATSAPP_TOKEN_SET?: string;
  WHATSAPP_PHONE_ID: string | null;
  WHATSAPP_BUSINESS_ACCOUNT_ID: string | null;
  WEBHOOK_VERIFY_TOKEN: string | null;
  // Brevo
  BREVO_API_KEY: string | null;
  BREVO_API_KEY_SET?: string;
  BREVO_SENDER_EMAIL: string | null;
  BREVO_SENDER_NAME: string | null;
}

export function useSettings() {
  return useQuery<ChannelSettings>({
    queryKey: ["settings"],
    queryFn: () => fetchWithAuth(`${API_URL}/settings`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ChannelSettings>) =>
      fetchWithAuth(`${API_URL}/settings`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
