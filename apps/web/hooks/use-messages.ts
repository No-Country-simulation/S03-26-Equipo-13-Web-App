"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

// Interfaz para definir qué enviamos
export interface SendEmailPayload {
    contactId: string;
    subject: string;
    content: string;
}

export function useSendEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SendEmailPayload) => {

            return await fetchWithAuth(`${API_URL}/messages/email`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },
        onSuccess: () => {
            // Si funciona, le decimos a react-query que "refresque" si tuviéramos listas activas
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
    });
}
