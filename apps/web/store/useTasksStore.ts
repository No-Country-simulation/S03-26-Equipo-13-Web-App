import { create } from "zustand";

//type TaskStatus = "PENDING" | "DONE" | "CANCELLED";
 export type TaskStatus = "pending" | "in_progress" | "done" | "cancelled"

export interface Task {
  id: string;
  title: string;
  done: boolean;
  status: TaskStatus;
  dueDate?: string;
  contact?: {
    name: string;
  };
}

interface TasksState {
  tasks: Task[];
  filter: TaskStatus | undefined;

  setTasks: (tasks: Task[]) => void;
  setFilter: (filter: TaskStatus | undefined) => void;

  toggleTask: (id: string) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  filter: undefined,

  setTasks: (tasks) => set({ tasks }),

  setFilter: (filter) => set({ filter }),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    })),
}));