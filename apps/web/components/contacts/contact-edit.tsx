"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { useContactsStore } from "@/store/contactsStore";

export function EditContactDialog({ contact }: any) {
  const token = useAuthStore((s) => s.token);
  const triggerRefresh = useContactsStore((s) => s.triggerRefresh);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: contact.name,
    email: contact.email || "",
    phone: contact.phone,
    status: contact.status,
  });

  const handleSubmit = async () => {
    try {
      await fetch(`http://localhost:3001/contacts/${contact.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      
      triggerRefresh();
      setOpen(false);
    } catch (err) {
      console.error("Error editando contacto", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar contacto</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            placeholder="Nombre"
          />

          <Input
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="Email"
          />

          <Input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            placeholder="Teléfono"
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
            className="border rounded p-2"
          >
            <option value="new">Nuevo</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="archived">Archivado</option>
          </select>

          <Button onClick={handleSubmit}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
