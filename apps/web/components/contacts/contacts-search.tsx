"use client";

import { Input } from "@/components/ui/input";
import { useContactsStore } from "@/store/useContactsStore";
import { useEffect, useState } from "react";

export function ContactsSearch() {
  const setSearch = useContactsStore((state) => state.setSearch);

  const [value, setValue] = useState("");

  // 🔥 debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(value);
    }, 400);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      placeholder="Buscar nombre, email, teléfono..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="h-9 bg-white border-slate-200 rounded-lg text-sm max-w-xs"
    />
  );
}