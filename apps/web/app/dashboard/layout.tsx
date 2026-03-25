
import { Sidebar } from "@/components/dashboard/sidebar-dashboard";
import { Header } from "@/components/dashboard/header-dashboard";





export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-slate-50">

            <Sidebar />


            <div className="flex flex-col flex-1 overflow-hidden">

                <Header />

                {/* Área de scroll del contenido */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}