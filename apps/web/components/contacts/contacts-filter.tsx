"use client";

import { Button } from "@/components/ui/button";
import { useContactsStore } from "@/store/contactsStore";


type StatusType = "new" | "active" | "inactive" | "archived" | "all";

type Tab = {
    label: string;
    value:StatusType;
}

const tabs: Tab[]= [
  { label: "Todos", value: "all"},
  { label: "Nuevo", value: "new" },
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
  { label: "Archivado", value: "archived" },
];
// export function ContactsFilters() {
//   const { status, setStatus } = useContactsStore();

//   return (
//     <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
//       {filters.map((filter) => (
//         <Button
//           key={filter.value}
//           variant="ghost"
//           onClick={() => setStatus(filter.value as any)}
//           className={`h-7 px-3 text-xs rounded-md transition-all ${
//             status === filter.value
//               ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
//               : "text-slate-500 hover:text-slate-700"
//           }`}
//         >
//           {filter.label}
//         </Button>
//       ))}
//     </div>
//   );
// }

export function ContactsFilters() {
  const status = useContactsStore((state) => state.status);
  const setStatus = useContactsStore((state) => state.setStatus);

  return (
    <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
      {tabs.map((tab) => {
        const isActive = status === tab.value;

        return (
          <Button
            key={tab.label}
            variant="ghost"
            onClick={() => setStatus(tab.value)}
            className={`h-7 px-3 text-xs rounded-md transition-all ${
              isActive
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}