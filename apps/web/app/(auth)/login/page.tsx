
"use client";

//Manejo de stados
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

//validador

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

//fuentes


export default function LoginPage() {
  return (
    <Card className="space-y-6">

      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <p className="text-xl font-semibold" >
          StartupCRM
        </p>

        <p className="text-sm text-gray-500">
          Tu centro de operaciones de ventas
        </p>
      </div>

      {/* FORM */}
      <div className="space-y-4">

        {/* EMAIL */}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Correo electrónico
          </p>
          <Input placeholder="tu@empresa.com" />
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Contraseña
          </p>
          <Input type="password" placeholder="••••••••" />
        </div>

        {/* BUTTON */}
        <Button className="w-full bg-[var(--brand)] text-[var(--brand-foreground)]">
          Ingresar al CRM
        </Button>
      </div>

      {/* FOOTER */}
      <p className="text-center text-xs text-gray-500">
        ¿Primera vez? Este es tu primer login — configuraremos tus canales ahora.
      </p>

    </Card>
  );
}