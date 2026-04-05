"use client";

import { Button } from "@/components/ui/button";
import { useTasksStore } from "@/store/useTasksStore";
import TaskCreateDialog from "./tasks-dialog";

export default function TasksHeader() {
  const { filter, setFilter } = useTasksStore();

  const tabs = [
    { label: "Todas", value: undefined },
    { label: "Pendientes", value: "PENDING" },
    { label: "Canceladas", value: "CANCELLED" },
    { label: "Completadas", value: "DONE" },
  ];

  return (
    <div className="flex justify-between mb-5">
      <div className="flex bg-slate-100 p-0.5 rounded-lg">
        {tabs.map((tab, i) => (
          <Button
            key={tab.label}
            variant="ghost"
            onClick={() => setFilter(tab.value as any)}
            className={`text-xs ${
              filter === tab.value || (!filter && i === 0)
                ? "bg-white shadow"
                : ""
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <TaskCreateDialog/>
    </div>
  );
}