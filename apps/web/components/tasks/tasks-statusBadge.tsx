"use client";

import { Badge } from "@/components/ui/badge";

export default function StatusBadgeTask({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-600",
    done: "bg-green-50 text-green-600",
    cancelled: "bg-red-50 text-red-600",
  };

  const labels: Record<string, string> = {
    pending: "Pendiente",
    done: "Completada",
    cancelled: "Cancelada",
  };

  return (
    <Badge className={`${styles[status]} text-[10px] px-2 py-0 rounded-full`}>
      {labels[status] ?? status}
    </Badge>
  );
}