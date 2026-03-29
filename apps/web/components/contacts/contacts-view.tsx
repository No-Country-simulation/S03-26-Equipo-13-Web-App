"use client";


import { ContactsTable } from "./contacts-table";
import { CreateContactDialog } from "./contact-dialog";
import { ContactsFilters } from "./contacts-filter";
import { ContactsSearch } from "./contacts-search";

export function ContactsView() {



  return (
    <>
      <div className="flex justify-end mb-4">
        <CreateContactDialog  />
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-[300px]">
       <ContactsSearch/>
        <ContactsFilters />
        </div>

      <ContactsTable  />
    </>
  );
}