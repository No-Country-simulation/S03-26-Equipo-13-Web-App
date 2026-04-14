"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSendEmail } from "@/hooks/use-messages";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";


export function EmailModal({ contactId }: { contactId: string }) {

    const { mutate: sendEmail, isPending } = useSendEmail();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");

    const handleSend = () => {
        if (!subject || !content) return alert("Completa los campos por favor");
        sendEmail(
            { contactId, subject, content },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["email-history", contactId] });
                    setSubject("");
                    setContent("");
                    setOpen(false);
                },
                onError: (e) => alert("Error enviando: " + e.message)
            }
        );
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Botón Lanzador que vivirá donde invoquemos el componente */}
                <Button className="h-9 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-xs font-bold gap-2 px-5 shadow-lg shadow-indigo-100">
                    <Plus className="w-4 h-4" /> Nuevo email
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Enviar correo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Asunto</label>
                        <Input
                            placeholder="Ej. Cotización de Software"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Mensaje</label>
                        <Textarea
                            placeholder="Escribe lo que quieras acá..."
                            className="min-h-[150px]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={isPending}
                        className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white"
                    >
                        {isPending ? "Enviando..." : "Enviar email"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}