"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

/**
 * Global notification listener — connects to /chat namespace and listens for
 * server-side events that should trigger UI notifications regardless of the
 * active page (task reminders, etc.).
 */
export function useNotificationsSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${API_URL}/chat`, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("task_reminder", (data: { taskId: string; title: string; assignedToId?: string }) => {
      toast.info(`⏰ Recordatorio de tarea: "${data.title}"`, {
        duration: 8000,
        description: "Esta tarea está por vencer",
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
}
