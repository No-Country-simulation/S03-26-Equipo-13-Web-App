"use client";


import { ContactsTable } from "./contacts-table";
import { CreateContactDialog } from "./contact-dialog";
import { ContactsFilters } from "./contacts-filter";
import { ContactsSearch } from "./contacts-search";



export function ContactsView() {
  return (
    <div className="space-y-6 p-4"> 
      
      {/*Botones arriba dere */}
      <div className="flex justify-end">
        <CreateContactDialog />
      </div>

      {/*Barra de búsqueda y filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[300px]">
          <ContactsSearch />
        </div>
        <ContactsFilters />
      </div>

      {/* La tabla ABAJO y ocupando todo el ancho */}
      <div className="w-full">
        <ContactsTable />
      </div>
      
    </div>
  );
}