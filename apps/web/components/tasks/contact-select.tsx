"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useContacts } from "@/hooks/use-contacts";

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

export default function ContactSelect({ value, onChange }: Props) {
  const { data: contacts = [], isLoading } = useContacts();
  

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar contacto" />
      </SelectTrigger>

      <SelectContent position="popper">
        {isLoading && (
          <SelectItem value="loading" disabled>
            Cargando...
          </SelectItem>
        )}

        {contacts.map((contact) => (
          <SelectItem key={contact.id} value={contact.id}>
            {contact.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}