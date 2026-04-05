"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { useTasksStore } from "@/store/useTasksStore";
import { useUpdateTask } from "@/hooks/use-tasks";

import StatusBadgeTask from "./tasks-statusBadge";

export default function TasksTable({ isLoading }: { isLoading: boolean }) {
  const { tasks, toggleTask } = useTasksStore();
  const updateTask = useUpdateTask();

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Tarea</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead className="text-right">Estado</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5}>Cargando...</TableCell>
            </TableRow>
          )}

          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox
                  checked={task.done}
                  onCheckedChange={() => {
                    toggleTask(task.id);

                    updateTask.mutate({
                      id: task.id,
                      data: { done: !task.done },
                    });
                  }}
                />
              </TableCell>

              <TableCell>
                <span className={task.done ? "line-through text-gray-400" : ""}>
                  {task.title}
                </span>
              </TableCell>

              <TableCell className={task.status === "CANCELLED" ? "text-red-500" : ""}>
                {task.date}
              </TableCell>

              <TableCell>{task.contact?.name}</TableCell>

              <TableCell className="text-right">
                <StatusBadgeTask status={task.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-3 border-t text-xs text-slate-400">
        Mostrando {tasks.length} tareas
      </div>
    </div>
  );
}