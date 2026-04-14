"use client";

import { Task } from "@/store/useTasksStore";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

export default function TaskDetailDialog({ open, onClose, task }: Props) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle de tarea</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* TITLE */}
          <div>
            <p className="text-xs text-slate-400">Título</p>
            <p className="font-medium">{task.title}</p>
          </div>

          {/* STATUS */}
          <div>
            <p className="text-xs text-slate-400">Estado</p>
            <p className="capitalize">{task.status}</p>
          </div>

          {/* DATE */}
          <div>
            <p className="text-xs text-slate-400">Fecha</p>
            <p>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "-"}
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <p className="text-xs text-slate-400">Contacto</p>
            <p>{task.contact?.name ?? "-"}</p>
          </div>

                  {/* DESCRIPTION*/}
          <div>
            <p className="text-xs text-slate-400">Nota</p>
            <p>{task.description}</p>
          </div>



        </div>
      </DialogContent>
    </Dialog>
  );
}