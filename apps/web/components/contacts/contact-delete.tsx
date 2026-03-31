"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useContactsStore } from "@/store/contactsStore";
import { Trash2 } from "lucide-react"; // O cualquier icono que prefieras
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteContactProps {
  contactId: string;
  contactName: string;
}

export function DeleteContactDialog({ contactId, contactName }: DeleteContactProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user); // Asumiendo que guardas el user aquí
  const triggerRefresh = useContactsStore((state) => state.triggerRefresh);

  // Verificación de rol -- consultar reglas del back
  if (user?.role !== "admin") return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:3001/contacts/${contactId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudo eliminar el contacto");

      toast.success("Contacto eliminado correctamente");
      triggerRefresh(); // Recarga la tabla
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el contacto");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. <br/>
            Eliminarás permanentemente al contacto{" "}
            <span className="font-semibold text-slate-900">{contactName}</span> de la base de datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}