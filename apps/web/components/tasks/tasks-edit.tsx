"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateTask } from "@/hooks/use-tasks";

export default function TaskEditDialog({
  open,
  onClose,
  task,
}: {
  open: boolean;
  onClose: () => void;
  task: any;
}) {
  const updateTask = useUpdateTask();

  const form = useForm({
    defaultValues: {
      title: "",
      dueDate: "",
      description: ""
    },
  });

 
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        dueDate: task.dueDate?.split("T")[0] || "",
        description: task.description
      });
    }
  }, [task]);

  const onSubmit = (data: any) => {
    updateTask.mutate({
      id: task.id,
      data: {
        title: data.title,
        ...(data.dueDate ? { dueDate: new Date(data.dueDate + "T12:00:00").toISOString() } : {}),
        description: data.description,
      },
    });

    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tarea</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input {...form.register("title")} />

          <Input type="date" {...form.register("dueDate")} />

          <Input {...form.register("description")} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}