"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { StatusBadge } from "./status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useContactsStore } from "@/store/useContactsStore";
import { TableSkeleton } from "../ui/table-skeleton";
import { ContactsPagination } from "./contacts-pagination";
import { EditContactDialog } from "./contact-edit";
import ContactDetail from "./contact-detail";
import { DeleteContactDialog } from "./contact-delete";

type Contact = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  status: "new" | "active" | "inactive" | "archived";
};

const statusLabelMap: Record<string, string> = {
  new: "Nuevo",
  active: "Activo",
  inactive: "Inactivo",
  archived: "Archivado",
};


export function ContactsTable() {
  const token = useAuthStore((state) => state.token);
  const { refreshKey, page, status, setPage, search } = useContactsStore();

  const setSelectedId = useContactsStore((s) => s.setSelectedId);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status && status !== "all") {
          params.append("status", status);
        }
        if (search) {
          params.append("busqueda", search);
        }
        const res = await fetch(`http://localhost:3001/contacts?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error en la respuesta");

        const result = await res.json();

        // Estructura esperada: { data: Contact[], totalPages: number }
        setContacts(result.data || []);
        setTotalPages(result.totalPages || 1);
      } catch (err) {
        console.error("Error cargando contactos", err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [token, refreshKey, status, page, search]); // Se ejecuta cuando cualquiera cambia

  if (loading) return <TableSkeleton />;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/40">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div
                    className="flex items-center gap-2 cursor-pointer group w-fit"
                    onClick={() => setSelectedId(contact.id)}
                  >
                    <Avatar className="h-9 w-9 transition-transform duration-200 group-hover:scale-105">
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold transition-colors duration-200 group-hover:bg-slate-500 group-hover:text-white">
                        {contact.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                      {contact.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell>{contact.email || "—"}</TableCell>
                <TableCell>{contact.phone}</TableCell>

                <TableCell>
                  <StatusBadge status={contact.status} />
                </TableCell>

                <TableCell>
                  <div onClick={(e) => e.stopPropagation}>
                    <EditContactDialog 
                    contact={contact} 
                    />
                    <DeleteContactDialog 
                      contactId={contact.id} 
                      contactName={contact.name} 
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-10 text-slate-500"
              >
                No se encontraron contactos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ContactsPagination totalPages={totalPages} currentPage={page} />
      <ContactDetail />
    </div>
  );
}
