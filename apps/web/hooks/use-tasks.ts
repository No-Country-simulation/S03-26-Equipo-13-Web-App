"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { API_URL } from "@/lib/config";

// ==============================
// TYPES
// ==============================
export type TaskStatus = "PENDING" | "DONE" | "CANCELLED";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  status: TaskStatus;
  date: string;
  contact?: {
    id: string;
    name: string;
  };
}

// ==============================
// GET TASKS
// ==============================
export function useTasks(filters?: { status?: TaskStatus; contact?: string }) {
  return useQuery({
    queryKey: ["tasks", filters],

    queryFn: async (): Promise<Task[]> => {
      const params = new URLSearchParams();

      if (filters?.status) params.append("status", filters.status);
      if (filters?.contact) params.append("contact", filters.contact);

      return fetchWithAuth(`${API_URL}/tasks?${params.toString()}`);
    },

    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

// ==============================
// CREATE TASK
// ==============================
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      dueDate: string;
      contactId?: string;
      description?: string;
    }) => {
      return fetchWithAuth(`${API_URL}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarea creada correctamente");
    },

    onError: () => {
      toast.error("Error al crear tarea");
    },
  });
}

// ==============================
// UPDATE TASK
// ==============================
/* export function useUpdateTask() {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Task>;
    }) => {
      return fetchWithAuth(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },

    onError: () => {
      toast.error("Error al actualizar tarea");
    },
  });
} */

  export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: any; // Usamos any temporalmente para la transformación
    }) => {
      // 1. Extraemos 'done' o 'completed' si vienen del formulario/UI
      const { done, completed, ...rest } = data;

      // 2. Construimos el payload real que el backend espera
      const payload = {
        ...rest,
        // Si 'done' es true, mandamos el status "done", de lo contrario "pending"
        // (Ajusta esta lógica según necesites otros estados)
        status: done === true ? "done" : (rest.status || "pending"),
      };

      console.log("Payload que realmente sale al Back:", payload);

      return fetchWithAuth(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // toast.success("Tarea actualizada"); // Opcional
    },

    onError: () => {
      toast.error("Error al actualizar tarea");
    },
  });
}