'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/api';
import { API_URL } from '../lib/config';

export interface EmailMessage {
  id: string;
  subject: string | null;
  content: string;
  direction: string;
  channel: string;
  status: string;
  contactId: string;
  createdAt: string;
  contact: {
    id: string;
    name: string;
    email: string | null;
  };
}

export interface SendEmailPayload {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  contactId?: string;
  replyTo?: string;
}

export function useEmailHistory(contactId?: string) {
  const params = contactId ? `?contactId=${contactId}` : '';
  return useQuery<EmailMessage[]>({
    queryKey: ['email-history', contactId],
    queryFn: () => fetchWithAuth(`${API_URL}/email/history${params}`),
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendEmailPayload) =>
      fetchWithAuth(`${API_URL}/email/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-history'] });
    },
  });
}
