
import { Download, Plus } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const contacts = [
    { id: 1, name: "Ana Torres", email: "ana@empresa.com", phone: "+57 300 111 2233", status: "Lead", tags: ["seguimiento", "vip"], channels: ["WA", "Email"], initial: "AT" },
    { id: 2, name: "Carlos Mendoza", email: "carlos@firma.co", phone: "+57 310 444 5566", status: "Negociación", tags: ["propuesta-enviada"], channels: ["WA", "Email"], initial: "CM" },
    { id: 3, name: "Lucia Restrepo", email: "lucia@startup.io", phone: "—", status: "Negociación", tags: ["seguimiento"], channels: ["Email"], initial: "LR" },
    { id: 4, name: "Jorge Pérez", email: "jorge@corp.com", phone: "+57 320 777 8899", status: "Activo", tags: ["vip"], channels: ["WA", "Email"], initial: "JP" },
    { id: 5, name: "María Vargas", email: "maria@email.com", phone: "+57 315 222 3344", status: "Perdido", tags: [], channels: ["WA", "Email"], initial: "MV" },
    { id: 6, name: "Roberto Gómez", email: "roberto@mipyme.co", phone: "+57 301 888 9900", status: "Lead", tags: ["seguimiento", "lead-frio"], channels: ["WA", "Email"], initial: "RG" },

];

export default function ContactPage() {
    return (
        <div className="bg-slate-50/30 ">

            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                    <div className="relative w-full max-w-xs">
                        <Input
                            placeholder="Buscar nombre, email, teléfono..."
                            className="h-9 bg-white border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
                        {['Todos', 'Lead', 'Negociación', 'Activo', 'Perdido'].map((tab, i) => (
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
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-9 rounded-lg border-slate-200 text-slate-600 gap-2 text-xs">
                        <Download className="w-3.5 h-3.5" /> Exportar
                    </Button>
                    <Button className="h-9 rounded-lg bg-[#6366f1] hover:bg-[#5558e3] gap-2 text-xs px-4">
                        <Plus className="w-3.5 h-3.5" /> Nuevo contacto
                    </Button>
                </div>
            </div>

            {/* Tabla Principal */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/40">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="text-slate-400 font-medium text-xs py-3">Nombre</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs">Email</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs">Teléfono</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs">Estado</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs">Etiquetas</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs">Canales</TableHead>
                            <TableHead className="text-slate-400 font-medium text-xs text-right px-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="h-8 w-8 bg-indigo-50 border border-indigo-100">
                                            <AvatarFallback className="text-indigo-600 text-[10px] font-bold">
                                                {contact.initial}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-slate-700 text-sm">{contact.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">{contact.email}</TableCell>
                                <TableCell className="text-slate-500 text-sm">{contact.phone}</TableCell>
                                <TableCell>
                                    <StatusBadge status={contact.status} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {contact.tags.length > 0 ? contact.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-indigo-50/80 text-indigo-600 border-none font-normal text-[10px] px-1.5 h-5">
                                                {tag}
                                            </Badge>
                                        )) : <span className="text-slate-300 text-xs italic">Sin etiquetas</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1.5">
                                        {contact.channels.map(ch => (
                                            <span key={ch} className={`text-[9px] font-bold px-1 py-0.5 rounded ${ch === 'WA' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {ch}
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-1.5">
                                        <Button variant="outline" className="h-7 px-2.5 rounded-md border-slate-200 text-slate-500 text-[10px] hover:bg-slate-50">
                                            WA
                                        </Button>
                                        <Button variant="outline" className="h-7 px-2.5 rounded-md border-slate-200 text-slate-500 text-[10px] hover:bg-slate-50">
                                            Email
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="p-3 border-t border-slate-100 bg-white">
                    <p className="text-[11px] text-slate-400">Mostrando {contacts.length} de 6 contactos</p>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        "Lead": "bg-blue-50 text-blue-600 border-blue-100",
        "Negociación": "bg-orange-50 text-orange-600 border-orange-100",
        "Activo": "bg-green-50 text-green-600 border-green-100",
        "Perdido": "bg-red-50 text-red-600 border-red-100",
    };
    return (
        <Badge className={`${styles[status] || "bg-slate-50"} border-none font-medium text-[11px] px-2 py-0 rounded-full shadow-none h-5`}>
            {status}
        </Badge>
    );
}