
"use client";

import { usePathname } from "next/navigation";
import { useNotificationsSocket } from "@/hooks/use-notifications-socket";

// Configuración de los títulos y subtítulos por ruta
const routeConfig: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": {
        title: "Dashboard",
        subtitle: "Resumen de actividad"
    },
    "/dashboard/contactos": {
        title: "Contactos",
        subtitle: "Gestión de leads y clientes"
    },
    "/dashboard/whatsapp": {
        title: "WhatsApp",
        subtitle: "Mensajería en tiempo real"
    },
    "/dashboard/email": {
        title: "Email",
        subtitle: "Correo electrónico"
    },
    "/dashboard/tareas": {
        title: "Tareas",
        subtitle: "Seguimientos y recordatorios"
    },
    "/dashboard/plantillas": {
        title: "Plantillas WA",
        subtitle: "Plantillas para envío"
    },
    "/dashboard/flujos": {
        title: "Flujos automáticos",
        subtitle: "Automatización de seguimientos"
    },
    "/dashboard/configuracion": {
        title: "Configuración",
        subtitle: "Canales, etiquetas y vistas"
    },
};

export function Header() {
    const pathname = usePathname();
    useNotificationsSocket(); // global task reminder toasts

    const currentRoute = routeConfig[pathname] || routeConfig["/dashboard"];

    return (
        <header className="h-16 shrink-0 bg-white border-b border-slate-100 flex items-center justify-between px-8">
            <div className="flex flex-col">
                <h2 className="text-base font-bold text-slate-900 leading-tight tracking-tight">
                    {currentRoute.title}
                </h2>
                <p className="text-sm text-slate-400 ">
                    {currentRoute.subtitle}
                </p>
            </div>

            <div className="flex items-center gap-3">
                {/* Espacio para botones tipo "+ Nuevo contacto" */}
            </div>
        </header>
    );
}