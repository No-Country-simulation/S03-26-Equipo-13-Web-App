"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
    LayoutDashboard,
    Users,
    Mail,
    CheckSquare,
    FileText,
    Zap,
    Settings,
    MessageSquare,
    MessageCircle
} from "lucide-react";

const menuGroups = [
    {
        title: "PRINCIPAL",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", badge: null },
            { icon: Users, label: "Contactos", href: "/dashboard/contactos", badge: 320 },
            { icon: MessageCircle, label: "WhatsApp", href: "/dashboard/whatsapp", badge: 3 },
            { icon: Mail, label: "Email", href: "/dashboard/email", badge: null },
            { icon: CheckSquare, label: "Tareas", href: "/dashboard/tareas", badge: 4 },
        ],
    },
    {
        title: "AUTOMATIZACIÓN",
        items: [
            { icon: FileText, label: "Plantillas WA", href: "/dashboard/plantillas", badge: 2 },
            { icon: Zap, label: "Flujos automáticos", href: "/dashboard/flujos", badge: null },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);


    const activeStyle = (isActive: boolean) => isActive ? {
        backgroundColor: 'rgba(var(--brand-primary), 0.08)',
        color: 'var(--color-brand)',
        borderColor: 'var(--color-brand)',
        borderTopLeftRadius: '5px',
        borderBottomLeftRadius: '5px'
    } : {};

    return (
        <aside className="w-64 h-screen flex flex-col bg-white border-r border-slate-100 shrink-0">

            {/* 1. Header */}
            <div className="p-4 flex items-center gap-3">
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white shadow-sm"
                    style={{ backgroundColor: 'var(--color-brand)' }}
                >
                    <MessageSquare className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                    <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">StartupCRM</h1>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-wider">v1.0 • MVP</p>
                </div>
            </div>

            <div className="border-t border-slate-100 w-full" />

            {/* 2. Navegación */}
            <nav className="flex-1 overflow-hidden px-3 py-2 flex flex-col gap-4">
                {menuGroups.map((group) => (
                    <div key={group.title}>
                        <h2 className="px-3 mb-1 text-[10px] font-bold text-slate-400 tracking-[0.1em]">
                            {group.title}
                        </h2>

                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border-l-4 ${isActive ? 'font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                                                }`}
                                            style={activeStyle(isActive)}
                                        >
                                            <item.icon
                                                className="h-4 w-4 shrink-0 transition-colors"
                                                style={{ color: isActive ? 'var(--color-brand)' : undefined }}
                                            />
                                            <span className="flex-1 text-[13px]">{item.label}</span>
                                            {item.badge && (
                                                <span
                                                    className="px-1.5 py-0.5 text-[9px] rounded-md font-bold"
                                                    style={{
                                                        backgroundColor: isActive ? 'rgba(var(--brand-primary), 0.15)' : 'rgba(var(--brand-primary), 0.08)',
                                                        color: 'var(--color-brand)'
                                                    }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {/* Configuración */}
                <div className="pb-2">
                    <h2 className="px-3 mb-1 text-[10px] font-bold text-slate-400 tracking-[0.1em]">CONFIG</h2>
                    {(() => {
                        const isConfigActive = pathname === "/dashboard/configuracion";
                        return (
                            <Link
                                href="/dashboard/configuracion"
                                className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border-l-4 ${isConfigActive ? 'font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                                    }`}
                                style={activeStyle(isConfigActive)}
                            >
                                <Settings
                                    className="h-4 w-4 shrink-0 transition-colors"
                                    style={{ color: isConfigActive ? 'var(--color-brand)' : undefined }}
                                />
                                <span className="text-[13px]">Configuración</span>
                            </Link>
                        );
                    })()}
                </div>
            </nav>

            {/* 3. Perfil de Usuario */}
            <div className="p-3 border-t border-slate-100">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                    <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-xs"
                        style={{ backgroundColor: 'rgba(var(--brand-primary), 0.08)', color: 'var(--color-brand)' }}
                    >
                        {user?.name?.slice(0, 2).toUpperCase() ?? "??"}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 truncate leading-tight">{user?.name ?? "—"}</p>
                        <p className="text-[9px] text-slate-400 truncate font-medium">{user?.email ?? "—"}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}