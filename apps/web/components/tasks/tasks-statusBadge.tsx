"use client";

import { Badge } from "@/components/ui/badge";


export default function StatusBadgeTask({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CANCELLED: "bg-red-50 text-red-600",
    DONE: "bg-green-50 text-green-600",
  };

  if (status === "PENDING") {
    return <span className="text-xs text-slate-300">—</span>;
  }

  return (
    <Badge className={`${styles[status]} text-[10px] px-2 py-0 rounded-full`}>
      {status}
    </Badge>
  );
}