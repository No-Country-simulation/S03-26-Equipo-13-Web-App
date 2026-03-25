
import { Plus } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const taskList = [
    { id: 1, title: "Llamar a Ana Torres — cierre pendiente", date: "Ayer", contact: "Ana Torres", status: "Vencida", completed: false },
    { id: 2, title: "Enviar propuesta actualizada a Lucia Restrepo", date: "Hoy", contact: "Lucia Restrepo", status: "Pendiente", completed: false },
    { id: 3, title: "Seguimiento post-venta Jorge Pérez", date: "Mañana", contact: "Jorge Pérez", status: "Pendiente", completed: false },
    { id: 4, title: "Agendar reunión con Carlos Mendoza", date: "Ayer", contact: "Carlos Mendoza", status: "Completada", completed: true },
];

export default function TareasPage() {
    return (
        <div className="bg-slate-50/30">
            {/* Header de Filtros y Acciones */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
                    {['Todas', 'Pendientes', 'Vencidas', 'Completadas'].map((tab, i) => (
                        <Button
                            key={tab}
                            variant="ghost"
                            className={`h-7 px-3 text-xs rounded-md transition-all ${i === 0
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                <Button className="h-9 rounded-lg bg-[#6366f1] hover:bg-[#5558e3] gap-2 text-xs px-4">
                    <Plus className="w-3.5 h-3.5" /> Nueva tarea
                </Button>
            </div>

            {/* Tabla de Tareas (Clon de ContactPage) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/40">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="w-[50px] py-3"></TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs">Tarea</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs">Fecha</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs">Contacto</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs text-right px-6">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {taskList.map((task) => (
                            <TableRow key={task.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-2.5 pl-6">
                                    <Checkbox
                                        checked={task.completed}
                                        className={`h-4 w-4 rounded border-slate-300 transition-colors ${task.completed ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' : ''
                                            }`}
                                    />
                                </TableCell>
                                <TableCell>
                                    <span className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                        }`}>
                                        {task.title}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    <span className={task.status === 'Vencida' && !task.completed ? 'text-red-500 font-medium' : ''}>
                                        {task.date}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">{task.contact}</TableCell>
                                <TableCell className="text-right px-6">
                                    <StatusBadgeTask status={task.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="p-3 border-t border-slate-100 bg-white">
                    <p className="text-[11px] text-slate-400">Mostrando {taskList.length} de {taskList.length} tareas</p>
                </div>
            </div>
        </div>
    );
}

function StatusBadgeTask({ status }: { status: string }) {
    const styles: Record<string, string> = {
        "Vencida": "bg-red-50 text-red-600 border-red-100",
        "Pendiente": "bg-blue-50 text-blue-600 border-blue-100",
        "Completada": "bg-green-50 text-green-600 border-green-100",
    };

    // Si no es "Vencida", quizás prefieras no mostrar badge para mantenerlo limpio como en tu imagen
    if (status === "Pendiente") return <span className="text-xs text-slate-300">—</span>;

    return (
        <Badge className={`${styles[status] || "bg-slate-50"} border-none font-medium text-[10px] px-2 py-0 rounded-full shadow-none h-5 uppercase tracking-tight`}>
            {status}
        </Badge>
    );
}