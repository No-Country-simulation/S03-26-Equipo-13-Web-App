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
import { useTasksStore, Task } from "@/store/useTasksStore";
import TaskEditDialog from "./tasks-edit";
import { Button } from "../ui/button";
import TaskDetailDialog from "./tasks-detail-dialog";

export default function TasksTable() {
  const { filter, openDetail, isDetailOpen, selectedTaskId, closeDetail } = useTasksStore();
  const { data: tasks = [], isLoading } = useTasks({
    status: filter,
  });

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const { isEditOpen, closeEdit } = useTasksStore();

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

  const { openEdit } = useTasksStore();

  const handleEdit = (task: Task) => {
    openEdit(task.id);
  };

  const handleCancel = (task: any) => {
    updateTask.mutate({
      id: task.id,
      data: {
        status: "cancelled",
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
            <TableHead className="text-right">Acciones</TableHead>
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
            const isCancel = task.status === "cancelled";
            return (
              <TableRow 
              key={task.id}
              onClick={() => openDetail(task.id)}
              className="cursor-pointer hover:bg-slate-50"
              >
                
                {/* CHECKBOX */}
                <TableCell>
                  <Checkbox
                    checked={isDone}
                    disabled={isCancel}
                    onCheckedChange={() => handleToggle(task)}
                    className={`
                 ${isDone ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" : ""}
                 ${isCancel ? "border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 opacity-60" : ""}
                `}
                  />
                </TableCell>

                {/* TITLE */}
                <TableCell>
                  <span
                    className={`
                        text-sm font-medium
                         ${isDone ? "line-through text-gray-400" : ""}
                          ${isCancel ? "line-through text-red-400" : ""}
                        `}
                  >
                    {task.title}
                  </span>
                </TableCell>

                {/* DATE */}
                <TableCell className="text-sm text-slate-500">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
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

                {/* ACTIONS */}
                <TableCell className="text-right space-x-2">
                  {task.status !== "cancelled" ? (
                    <>
                    <Button 
                    variant="outline" size="sm"
                    onClick={(e) => {e.stopPropagation(), handleEdit(task)}}
                  >
                    Editar
                  </Button>

                  <Button
                    onClick={() => handleCancel(task)}
                    variant="destructive" size="sm"
                  >
                    Cancelar
                  </Button>
                    </>
                  ) :(
                     <span className="text-xs text-slate-400">—</span>
                    )}
               
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TaskEditDialog
        open={isEditOpen}
        onClose={closeEdit}
        task={selectedTask}
      />

          <TaskDetailDialog
  open={isDetailOpen}
  onClose={closeDetail}
  task={selectedTask}
/>
      <div className="p-3 border-t text-xs text-slate-400">
        Mostrando {tasks.length} tareas
      </div>
    </div>
  );
}
