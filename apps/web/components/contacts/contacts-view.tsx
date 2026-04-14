"use client";

import { Download } from "lucide-react";
import { ContactsTable } from "./contacts-table";
import { CreateContactDialog } from "./contact-dialog";
import { ContactsFilters } from "./contacts-filter";
import { ContactsSearch } from "./contacts-search";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/config";
import { useAuthStore } from "@/store/authStore";

function ExportContactsButton() {
  const token = useAuthStore((s) => s.token);

  const handleExport = () => {
    fetch(`${API_URL}/export/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Error al exportar");
        return r.blob();
      })
      .then((blob) => {
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `contactos-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(href);
      })
      .catch(() => alert("Error al exportar contactos"));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="h-9 gap-2 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
    >
      <Download className="w-3.5 h-3.5" />
      Exportar CSV
    </Button>
  );
}

export function ContactsView() {
  return (
    <div className="space-y-6 p-4">

      {/* Botones arriba derecha */}
      <div className="flex justify-end gap-2">
        <ExportContactsButton />
        <CreateContactDialog />
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[300px]">
          <ContactsSearch />
        </div>
        <ContactsFilters />
      </div>

      {/* Tabla */}
      <div className="w-full">
        <ContactsTable />
      </div>

    </div>
  );
}
