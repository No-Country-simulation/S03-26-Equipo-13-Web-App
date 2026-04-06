"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { taskSchema, TaskFormValues } from "@/lib/validators/task";
import { useCreateTask } from "@/hooks/use-tasks";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ContactSelect from "./contact-select";

export default function TaskCreateDialog() {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      dueDate: "",
      contactId: "",
      description: "",
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    console.log("data enviada", data);
    await createTask.mutateAsync(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 bg-indigo-500 text-white text-xs">
          Nueva tarea
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md"
        // 1. Evita el error de aria-hidden al interactuar con el select
  onOpenAutoFocus={(e) => e.preventDefault()} 
  // 2. Evita que el cierre del select bloquee el modal
  onCloseAutoFocus={(e) => {
    e.preventDefault();
    // Opcional: devolver el foco manualmente a algo seguro si es necesario
  }}
      >
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
          <DialogDescription className="sr-only">
    Llena los datos para crear una nueva tarea.
  </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div>
            <Input placeholder="Título" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <Input type="date" {...form.register("dueDate")} />
            {form.formState.errors.dueDate && (
              <p className="text-xs text-red-500">
                {form.formState.errors.dueDate.message}
              </p>
            )}
          </div>

          {/* Contacto */}
          <div>
            <ContactSelect
              value={form.watch("contactId")}
              onChange={(value) => form.setValue("contactId", value)}
            />

            {form.formState.errors.contactId && (
              <p className="text-xs text-red-500">
                {form.formState.errors.contactId.message}
              </p>
            )}
          </div>

          {/* Reminder/Description */}
          <div>
            <Input
              placeholder="Recordatorio (opcional)"
              {...form.register("description")}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "Guardando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
