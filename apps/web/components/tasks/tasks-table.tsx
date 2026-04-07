"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { useTasks, useUpdateTask } from "@/hooks/use-tasks";

import StatusBadgeTask from "./tasks-statusBadge";
import { TableSkeleton } from "../ui/table-skeleton";
import { useTasksStore } from "@/store/useTasksStore";

export default function TasksTable() {
  const { filter } = useTasksStore();
  const { data: tasks = [], isLoading } = useTasks({
    status: filter,
  });
  const updateTask = useUpdateTask();

  const handleToggle = (task: any) => {
    const isDone = task.status === "done";

    updateTask.mutate({
      id: task.id,
      data: {
        done: !isDone, //  el hook lo transforma a status
      },
    });
  };

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
              <TableCell colSpan={5} className="p-0">
                {" "}
              
                <TableSkeleton />
              </TableCell>
            </TableRow>
          )}

          {tasks.map((task) => {
            const isDone = task.status === "done";

            return (
              <TableRow key={task.id}>
                {/* CHECKBOX */}
                <TableCell>
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={() => handleToggle(task)}
                    className={
                      isDone
                        ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        : ""
                    }
                  />
                </TableCell>

                {/* TITLE */}
                <TableCell>
                  <span
                    className={`text-sm font-medium transition-all duration-200 ${
                      isDone
                        ? "line-through text-gray-400 opacity-70"
                        : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </span>
                </TableCell>

                {/* DATE */}
                <TableCell className="text-sm text-slate-500">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("es-AR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year : "numeric"
                      }
                    )
                    : "-"}
                </TableCell>

                {/* CONTACT */}
                <TableCell className="text-sm text-slate-500">
                  {task.contact?.name ?? "-"}
                </TableCell>

                {/* STATUS */}
                <TableCell className="text-right">
                  <StatusBadgeTask status={task.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="p-3 border-t text-xs text-slate-400">
        Mostrando {tasks.length} tareas
      </div>
    </div>
  );
}
