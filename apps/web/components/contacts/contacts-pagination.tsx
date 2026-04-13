"use client";

import { Button } from "@/components/ui/button";
import { useContactsStore } from "@/store/useContactsStore";

type Props = {
  totalPages: number;
  currentPage: number;
};

export function ContactsPagination({ totalPages, currentPage }: Props) {
  const setPage = useContactsStore((state) => state.setPage);

  return (
    <div className="flex justify-between items-center p-3 border-t border-slate-100">
      
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
      >
        Anterior
      </Button>

      <span className="text-xs text-slate-500">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => setPage(currentPage + 1)}
      >
        Siguiente
      </Button>
    </div>
  );
}