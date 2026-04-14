"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

// Fetches all contacts (up to 500) for use in dropdowns and chat lists.
// The contacts table uses its own paginated fetch.
export function useContacts() {
  return useQuery({
    queryKey: ["contacts-all"],
    queryFn: async (): Promise<Contact[]> => {
      const res = await fetchWithAuth(`${API_URL}/contacts?limit=500&page=1`);
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}