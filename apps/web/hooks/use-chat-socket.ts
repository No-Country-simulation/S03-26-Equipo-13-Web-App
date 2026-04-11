"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/config";
import { Message } from "./use-whatsapp";

export function useChatSocket(contactId: string | null) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!contactId) return;

    // Connect to the /chat namespace
    const socket = io(`${API_URL}/chat`, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_contact", contactId);
    });

    // New inbound or outbound message
    socket.on("new_message", (message: Message) => {
      queryClient.setQueryData<Message[]>(
        ["messages", contactId],
        (prev = []) => {
          // Avoid duplicates (optimistic update may have already added it)
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        }
      );
    });

    // Status update: sent → delivered → read → failed
    socket.on("message_status", ({ id, status }: { id: string; wamid: string; status: string }) => {
      queryClient.setQueryData<Message[]>(
        ["messages", contactId],
        (prev = []) => prev.map((m) => (m.id === id ? { ...m, status: status as Message["status"] } : m))
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [contactId, queryClient]);
}
