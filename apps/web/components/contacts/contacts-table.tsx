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
import { ContactsPagination } from "./contacts-pagination";

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

//enviar todo al back
// export function ContactsTable() {
//   const token = useAuthStore((state) => state.token)
//   const refreshKey = useContactsStore((state) => state.refreshKey);
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [loading, setLoading] = useState(true);
//   const page = useContactsStore((state) => state.page)
//   const setPage = useContactsStore((state) => state.setPage)
//   const status = useContactsStore((state) => state.status);

//   const [totalPages, setTotalPages]= useState(1);
  
  
//   const limit = 5


// const fetchContacts = async () => {
//   try {

//     const params = new URLSearchParams();



//     if (status && status !== "all") {
//   params.append("status", status);
// }
// params.append("page", page.toString())
// params.append("limit", limit.toString())
// const query = params.toString();

// const url = query
//   ? `http://localhost:3001/contacts?${query}`
//   : `http://localhost:3001/contacts`;


//     const res = await fetch(url, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const result = await res.json();
   
//     setContacts(result.data || []);
//     if (!Array.isArray(result)) {
//   setTotalPages(result.totalPages || 1);
  
// }
//   //ver data
//     console.log(result.data)
    

//   } catch (err) {
//     console.error("Error cargando contactos", err);
//     setContacts([])
//   } finally {
//     setLoading(false);
//   }
// };

// //escuchar todos los cambios
// useEffect(() => {
//   if (token) {
//     setLoading(true);
//     fetchContacts();
//   }
// }, [token, refreshKey,status,page]);

//   if (loading) return <ContactsSkeleton/>

//   return (
//     <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
//       <Table>
//         <TableHeader className="bg-slate-50/40">
//           <TableRow>
//             <TableHead>Nombre</TableHead>
//             <TableHead>Email</TableHead>
//             <TableHead>Teléfono</TableHead>
//             <TableHead>Estado</TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {contacts.map((contact) => (
//             <TableRow key={contact.id}>
//               <TableCell>
//                 <div className="flex items-center gap-2">
//                   <Avatar className="h-8 w-8 bg-indigo-50">
//                     <AvatarFallback>
//                       {contact.name.slice(0, 2).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   {contact.name}
//                 </div>
//               </TableCell>

//               <TableCell>{contact.email || "—"}</TableCell>
//               <TableCell>{contact.phone}</TableCell>

//               <TableCell>
//                 <StatusBadge status={contact.status} />
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//       <ContactsPagination
//   totalPages={totalPages}
//   currentPage={page}
// />
//     </div>
//   );
// }


export function ContactsTable() {
  const token = useAuthStore((state) => state.token);
  const { refreshKey, page, status, setPage, search } = useContactsStore(); 

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

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

  if (loading) return <ContactsSkeleton />;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
          {contacts.length > 0 ? (
            contacts.map((contact) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                No se encontraron contactos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <ContactsPagination totalPages={totalPages} currentPage={page} />
    </div>
  );
   
  
}