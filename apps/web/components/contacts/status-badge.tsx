import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-50 text-blue-600",
    active: "bg-green-50 text-green-600",
    inactive: "bg-gray-100 text-gray-500",
    archived: "bg-red-50 text-red-600",
  };

  const labels: Record<string, string> = {
    new: "Nuevo",
    active: "Activo",
    inactive: "Inactivo",
    archived: "Archivado",
  };

  return (
    <Badge className={`${styles[status]} border-none text-xs`}>
      {labels[status]}
    </Badge>
  );
}