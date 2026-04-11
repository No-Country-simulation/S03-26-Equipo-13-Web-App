"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface Contact {
  id: string;
  name: string;
  email?: string;
}

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async (): Promise<Contact[]> => {
      const res = await fetchWithAuth(`${API_URL}/contacts`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}