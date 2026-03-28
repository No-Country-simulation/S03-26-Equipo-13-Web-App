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
import { useContactsStore } from "@/store/contactsStore";
import { ContactsSkeleton } from "./contacts-skeleton";

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
  const token = useAuthStore((state) => state.token)
  const refreshKey = useContactsStore((state) => state.refreshKey);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const status = useContactsStore((state) => state.status);


//   useEffect(() => {
//     const fetchContacts = async () => {
//       try {
//         const res = await fetch("http://localhost:3001/contacts", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
            
//         const result = await res.json();
//         //console.log("DATA", data)
//         setContacts(result.data);
//       } catch (err) {
//         console.error("Error cargando contactos", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) fetchContacts();
//   }, [token]);

// const fetchContacts = async () => {
//   try {


//     const res = await fetch("http://localhost:3001/contacts", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const result = await res.json();
//     setContacts(result.data);
//   } catch (err) {
//     console.error("Error cargando contactos", err);
//   } finally {
//     setLoading(false);
//   }
// };

const fetchContacts = async () => {
  try {
    // let url = "http://localhost:3001/contacts";

    // if (status !== "all") {
    //   url += `?status=${status}`;
    // 
    const params = new URLSearchParams();

    // if (status) params.append("status", status);

    // const url = `http://localhost:3001/contacts?${params.toString()}`;    

    if (status && status !== "all") {
  params.append("status", status);
}

const query = params.toString();
const url = query
  ? `http://localhost:3001/contacts?${query}`
  : `http://localhost:3001/contacts`;


    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    const data = Array.isArray(result)
    ? result
    : result.data;
    setContacts(data || []);
    console.log(result.data)
  } catch (err) {
    console.error("Error cargando contactos", err);
    setContacts([])
  } finally {
    setLoading(false);
  }
};

//escuchar todos los cambios
useEffect(() => {
  if (token) {
    setLoading(true);
    fetchContacts();
  }
}, [token, refreshKey,status]);

  if (loading) return <ContactsSkeleton/>

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/40">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-indigo-50">
                    <AvatarFallback>
                      {contact.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {contact.name}
                </div>
              </TableCell>

              <TableCell>{contact.email || "—"}</TableCell>
              <TableCell>{contact.phone}</TableCell>

              <TableCell>
                <StatusBadge status={contact.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}