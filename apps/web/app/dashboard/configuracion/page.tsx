"use client";

import { useState } from 'react';
import { MessageCircle, Mail, X, Plus, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTags, useCreateTag, useDeleteTag, tagColor } from "@/hooks/use-tags";

export default function ConfiguracionPage() {
    const { data: tags = [], isLoading: tagsLoading } = useTags();
    const { mutate: createTag, isPending: creating } = useCreateTag();
    const { mutate: deleteTag } = useDeleteTag();
    const [newTag, setNewTag] = useState("");

    const handleAddTag = () => {
        const trimmed = newTag.trim();
        if (!trimmed) return;
        createTag(trimmed, { onSuccess: () => setNewTag("") });
    };

    return (
        <div className="bg-slate-50 min-h-screen space-y-6 max-w-6xl mx-auto">

            {/* 1. Canales Conectados */}
            <div className="bg-white border rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Canales conectados</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-slate-700">WhatsApp Business</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">Meta Cloud API</span>
                            <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px] px-3 py-0.5 rounded-full">
                                Activo
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">Brevo SMTP</span>
                            <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] px-3 py-0.5 rounded-full">
                                Activo
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Etiquetas */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Etiquetas</h3>

                {tagsLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                        {tags.length === 0 && (
                            <p className="text-xs text-slate-400">Sin etiquetas todavía. Crea la primera.</p>
                        )}
                        {tags.map((tag) => (
                            <div
                                key={tag.id}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${tagColor(tag.name)}`}
                            >
                                {tag.name}
                                <button
                                    onClick={() => deleteTag(tag.id)}
                                    className="opacity-50 hover:opacity-100 transition-opacity ml-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        placeholder="Nombre de etiqueta..."
                        className="flex-1 bg-slate-50/50 border-slate-200 rounded-xl h-10 text-sm shadow-none"
                    />
                    <Button
                        onClick={handleAddTag}
                        disabled={!newTag.trim() || creating}
                        className="bg-[#6366f1] hover:bg-[#5558e3] rounded-xl px-6 h-10 text-xs font-bold"
                    >
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5 mr-1.5" />Crear</>}
                    </Button>
                </div>
            </div>

            {/* 3. Vistas Guardadas */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-1">Vistas guardadas</h3>
                <p className="text-[11px] text-slate-400 mb-4">Próximamente podrás guardar filtros de contactos como vistas rápidas.</p>
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                    <p className="text-xs">Sin vistas guardadas</p>
                </div>
            </div>
        </div>
    );
}
