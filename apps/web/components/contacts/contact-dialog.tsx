"use client";

import { useState } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { CreateContactForm } from "./create-contact-form";


export function CreateContactDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      {/* TRIGGER */}
      <DialogTrigger asChild>
        <Button className="h-9 rounded-lg bg-[#6366f1] hover:bg-[#5558e3] gap-2 text-xs px-4">
          + Nuevo contacto
        </Button>
      </DialogTrigger>

      {/* MODAL */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo contacto</DialogTitle>
        </DialogHeader>

        {/* FORM SEPARADO */}
        <CreateContactForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}