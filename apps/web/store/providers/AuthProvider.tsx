"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";

// Apenas el cliente carga, hidratamos la sesión desde el LocalStorage
export function AuthProvider({ children }: { children: ReactNode }) {
    const initializeAuth = useAuthStore((state) => state.initialize);

    useEffect(() => {

        initializeAuth();
    }, [initializeAuth]);

    return <>{children}</>;
}
