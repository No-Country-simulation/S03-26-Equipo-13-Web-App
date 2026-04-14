import ProgressSteps from "./progress-steps";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StepWhatsapp({ onNext }: { onNext?: () => void }) {
  return (
    <div className="space-y-4">

      <ProgressSteps step={1} />

      <div>
        <p className="text-lg font-semibold">
          Conecta WhatsApp
        </p>
        <p className="text-sm text-gray-500">
          Ingresa el número desde donde enviarás mensajes.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Número</p>

        <div className="flex gap-2">
          <select className="border rounded-md px-2">
            <option>+57</option>
            <option>+1</option>
          </select>

          <Input placeholder="300 123 4567" />
        </div>
      </div>

      <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-md">
        Una sola cuenta por usuario.
      </div>

      <Button onClick={onNext} className="w-full bg-[var(--brand)]">
        Enviar código →
      </Button>

    </div>
  );
}