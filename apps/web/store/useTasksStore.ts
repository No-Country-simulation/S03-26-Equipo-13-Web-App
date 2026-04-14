import { create } from "zustand";

//type TaskStatus = "PENDING" | "DONE" | "CANCELLED";
export type TaskStatus = "pending" | "in_progress" | "done" | "cancelled";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  status: TaskStatus;
  dueDate?: string;
  description: string;
  contact?: {
    name: string;
  };
}

interface TasksState {
  tasks: Task[];
  filter: TaskStatus | undefined;

  selectedTaskId: string | null;
  isEditOpen: boolean;
  isDetailOpen: boolean;

  setTasks: (tasks: Task[]) => void;
  setFilter: (filter: TaskStatus | undefined) => void;
  openEdit: (taskId: string) => void;
  closeEdit: () => void;
  toggleTask: (id: string) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  filter: undefined,

  setTasks: (tasks) => set({ tasks }),

  selectedTaskId: null,
  isEditOpen: false,
  isDetailOpen: false,

  setFilter: (filter) => set({ filter }),

  openEdit: (taskId) =>
    set({
      selectedTaskId: taskId,
      isEditOpen: true,
    }),

  closeEdit: () =>
    set({
      selectedTaskId: null,
      isEditOpen: false,
    }),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      ),
    })),

  

  openDetail: (id) =>
    set({
      selectedTaskId: id,
      isDetailOpen: true,
    }),

  closeDetail: () =>
    set({
      isDetailOpen: false,
      selectedTaskId: null,
    }),
}));
