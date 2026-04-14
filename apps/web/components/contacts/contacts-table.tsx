"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { MessageCircle, Mail } from "lucide-react";
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
import { useContactsStore } from "@/store/contactsStore";
import { TableSkeleton } from "../ui/table-skeleton";
import { ContactsPagination } from "./contacts-pagination";
import { EditContactDialog } from "./contact-edit";
import ContactDetail from "./contact-detail";
import { DeleteContactDialog } from "./contact-delete";
import { API_URL } from "@/lib/config";

type Contact = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  status: "new" | "active" | "inactive" | "archived";
};

// ── Channel badges ────────────────────────────────────────────────────────────
function ChannelBadges({ phone, email }: { phone?: string; email?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {phone && (
        <span
          title="WhatsApp disponible"
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-100 text-[10px] font-semibold"
        >
          <MessageCircle className="w-3 h-3" />
          WA
        </span>
      )}
      {email && (
        <span
          title="Email disponible"
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-semibold"
        >
          <Mail className="w-3 h-3" />
          Email
        </span>
      )}
      {!phone && !email && (
        <span className="text-[10px] text-slate-300">—</span>
      )}
    </div>
  );
}

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
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (status && status !== "all") params.append("status", status);
        if (search) params.append("busqueda", search);

        const res = await fetch(`${API_URL}/contacts?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error en la respuesta");
        const result = await res.json();
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
  }, [token, refreshKey, status, page, search]);

  if (loading) return <TableSkeleton />;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/40">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Canales</TableHead>
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
                {/* Nombre */}
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

                {/* Canales */}
                <TableCell>
                  <ChannelBadges phone={contact.phone} email={contact.email} />
                </TableCell>

                {/* Email */}
                <TableCell className="text-slate-500 text-sm">
                  {contact.email || <span className="text-slate-300">—</span>}
                </TableCell>

                {/* Teléfono */}
                <TableCell className="text-slate-500 text-sm font-mono">
                  {contact.phone}
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <StatusBadge status={contact.status} />
                </TableCell>

                {/* Acciones */}
                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    <EditContactDialog contact={contact} />
                    <DeleteContactDialog contactId={contact.id} contactName={contact.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-slate-500">
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
