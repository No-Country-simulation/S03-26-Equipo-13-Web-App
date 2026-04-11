"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface DashboardSummary {
  totalContacts: number;
  activeContacts: number;
  totalMessages: number;
  messagesThisWeek: number;
  inboundMessages: number;
  outboundMessages: number;
  responseRate: string;
  pendingTasks: number;
  newContactsThisWeek: number;
  funnel: Record<string, number>;
}

export interface DayStats {
  date: string;
  inbound: number;
  outbound: number;
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["analytics", "summary"],
    queryFn: () => fetchWithAuth(`${API_URL}/analytics/summary`),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDashboardMessages(range: "7d" | "30d" = "7d") {
  return useQuery<DayStats[]>({
    queryKey: ["analytics", "messages", range],
    queryFn: () => fetchWithAuth(`${API_URL}/analytics/messages?range=${range}`),
    staleTime: 1000 * 60 * 2,
  });
}
