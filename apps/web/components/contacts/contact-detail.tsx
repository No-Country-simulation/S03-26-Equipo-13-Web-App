"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useContactsStore } from "@/store/contactsStore";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ContactDetail() {
  const token = useAuthStore((s) => s.token);

  const { selectedId, setSelectedId } = useContactsStore();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    done: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  useEffect(() => {
    if (!selectedId || !token) return;

    const fetchContact = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3001/contacts/${selectedId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        setContact(data);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [selectedId, token]);

  if (loading)
    return <div className="p-10 text-center">Cargando detalle...</div>;
  if (!contact) return null;

  return (
    <Dialog
      open={!!selectedId}
      onOpenChange={(open) => {
        if (!open) setSelectedId(null);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle del contacto</DialogTitle>
          <DialogDescription className="sr-only">
            Información detallada de mensajes y tareas del contacto.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-10 text-center">Cargando detalle...</div>
        ) : contact ? (
          <div className="p-6">
            <h1 className="text-xl font-bold">{contact.name}</h1>
            <p>{contact.email}</p>
            <p>{contact.phone}</p>

            <div className="mt-6">
              <h2 className="font-semibold">Mensajes</h2>
              {contact.messages?.map((m: any) => (
                <div key={m.id} className="text-sm border-b py-1">
                  {m.content}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h2 className="font-semibold mb-3 text-gray-800">Tareas</h2>
              <div className="flex flex-col gap-2">
                {contact.tasks?.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {t.title}
                    </span>

                    <span
                      className={`
          px-2.5 py-0.5 rounded-full text-xs  border
          ${styles[t.status] || "bg-gray-50 text-gray-600 border-gray-200"}
        `}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
