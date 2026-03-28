"use client";


import { ContactsTable } from "./contacts-table";
import { CreateContactDialog } from "./contact-dialog";
import { ContactsFilters } from "./contacts-filter";

export function ContactsView() {



  return (
    <>
      <div className="flex justify-end mb-4">
        <CreateContactDialog  />
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-[300px]">
        {/* 🔜 luego va el search acá */}
    <ContactsFilters />
        </div>

      <ContactsTable  />
    </>
  );
}