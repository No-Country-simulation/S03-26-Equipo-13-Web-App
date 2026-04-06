"use client";
//core
import { useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useTasksStore } from "@/store/useTasksStore";

import TasksHeader from "./tasks-header";
import TasksTable from "./tasks-table";

export default function TasksClient() {
  const { setTasks, filter } = useTasksStore();
  const { data, isLoading } = useTasks({ status: filter });

  useEffect(() => {
    if (data) setTasks(data);
  }, [data, setTasks]);

  return (
    <div className="bg-slate-50/30">
      <TasksHeader />
      <TasksTable isLoading={isLoading} />
    </div>
  );
}