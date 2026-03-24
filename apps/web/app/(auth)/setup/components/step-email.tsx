import ProgressSteps from "./progress-steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StepEmail() {
  return (
    <div className="space-y-5">

      {/* PROGRESS */}
      <ProgressSteps step={2} />

      {/* HEADER */}
      <div>
        <p className="text-lg font-semibold">
          Conecta tu correo
        </p>

        <p className="text-sm text-gray-500">
          Elige cómo quieres conectar tu cuenta de email.
        </p>
      </div>

      {/* OPTIONS AGREGAR selectores */}
      <div className="space-y-3">

        {/* GMAIL */}
        <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer border-[var(--brand)] bg-[var(--bg-2)]">
           {/* manejar estados mas adelante si se conecta con GMIL  */}
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-red-100 text-red-600 font-bold">
            G
          </div>

          <div>
            <p className="text-sm font-semibold">
              Gmail / Google Workspace
            </p>
            <p className="text-xs text-gray-500">
              Conecta con Google en un clic
            </p>
          </div>
        </div>

        {/* SMTP */}
        <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-blue-100">
            📧
          </div>

          <div>
            <p className="text-sm font-semibold">
              SMTP / Brevo
            </p>
            <p className="text-xs text-gray-500">
              Configuración manual
            </p>
          </div>
        </div>

      </div>

      {/* GMAIL FORM */}
      <div>
        <Button className="w-full bg-[var(--brand)]">
          Continuar con Google
        </Button>
      </div>

      {/* SMTP FORM (solo UI visible por ahora) */}
      <div className="space-y-3 pt-2">

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium">Servidor SMTP</p>
            <Input placeholder="smtp.brevo.com" />
          </div>

          <div>
            <p className="text-sm font-medium">Puerto</p>
            <Input placeholder="587" />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Email remitente</p>
          <Input placeholder="tu@empresa.com" />
        </div>

        <div>
          <p className="text-sm font-medium">Contraseña / API Key</p>
          <Input type="password" placeholder="••••••••••" />
        </div>

        <Button className="w-full bg-[var(--brand)]">
                     Probar y conectar
        </Button>

      </div>

    </div>
  );
}