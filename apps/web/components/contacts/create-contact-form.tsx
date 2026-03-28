"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";

import {
  createContactSchema,
  CreateContactInput,
  statusOptions
} from "@/lib/validators/contact";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useContactsStore } from "@/store/contactsStore";

type Props = {
  onSuccess?: () => void;
};

export function CreateContactForm({ onSuccess }: Props) {
  const token = useAuthStore((state) => state.token)
  const triggerRefresh= useContactsStore((state)=> state.triggerRefresh)

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "new",
    //   assignedToId: "",
      notes:"",
    },
  });

  const onSubmit = async (data: CreateContactInput) => {
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Error al crear contacto");
      }

      // Reset form
      reset();

      //trigger
      triggerRefresh()
      
      // Cerrar modal
      onSuccess?.();

      console.log("Contacto creado:", result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      
      {/* NOMBRE */}
      <div>
        <p className="text-sm font-medium">Nombre</p>
        <Input {...register("name")} placeholder="Ej: Juan Pérez" />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* EMAIL */}
      <div>
        <p className="text-sm font-medium">Email</p>
        <Input {...register("email")} placeholder="juan@empresa.com" />
      </div>

      {/* TELÉFONO */}
      <div>
        <p className="text-sm font-medium">Teléfono</p>
        <Input {...register("phone")} placeholder="+57 300 123 4567" />
        {errors.phone && (
          <p className="text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* ESTADO */}
      <div>
        <p className="text-sm font-medium">Estado</p>
         {/* <select
          {...register("status")}
          className="w-full h-9 rounded-md border border-slate-200 text-sm px-2"
        >
          <option value="new">Lead</option>
          <option value="active">Negociación</option>
          <option value="inactive">Activo</option>
          <option value="archivied">Perdido</option>
        </select>  */}
         <select
            {...register("status")}
            className="w-full h-9 rounded-md border border-slate-200 text-sm px-2"
            >
                {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
                ))}
        </select> 
      </div>

      {/* RESPONSABLE assinedToId , no esta relacionado el campo con el USER real*/}
      {/* <div>
        <p className="text-sm font-medium">Responsable</p>
        <Input placeholder="ID del usuario (ej: user_123)" {...register("assignedToId")} />
        </div> */}

    {/*NOTAS*/}
        <div>
            <p className="text-sm font-medium">Notas</p>
        <textarea
            {...register("notes")}
            placeholder="Agregar notas sobre el contacto..."
            className="w-full min-h-[80px] rounded-md border border-slate-200 text-sm px-2 py-2"
        />
        </div>

      {/* ERROR */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-[var(--brand)] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando..." : "Crear contacto"}
        </Button>
      </div>
    </form>
  );
}