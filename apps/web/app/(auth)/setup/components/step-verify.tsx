import ProgressSteps from "./progress-steps";
import { Button } from "@/components/ui/button";

export default function StepVerify({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  return (
    <div className="space-y-5">

      {/* PROGRESS */}
      <ProgressSteps step={1} />

      {/* HEADER */}
      <div>
        <p className="text-lg font-semibold">
          Verifica tu número
        </p>

        <p className="text-sm text-gray-500">
          Enviamos un código de 6 dígitos a{" "}
          <strong>+57 11111111</strong>
        </p>

        <p className="text-xs text-[var(--brand)] mt-1">
          Demo: usa el código 123456
        </p>
      </div>

      {/* OTP INPUTS */}
      <div className="flex justify-between gap-2">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            maxLength={1}
            className="
              w-10 h-12 text-center text-lg font-semibold
              border border-gray-300 rounded-md
              focus:outline-none focus:ring-2 focus:ring-[var(--brand)]
            "
          />
        ))}
      </div>

      {/* MESSAGE */}
      <div className="text-center text-xs text-green-600 min-h-[20px]">
        ✓ Número verificado
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Cambiar
        </Button>

        <Button onClick={onNext} className="flex-1 bg-[var(--brand)]">
          Confirmar →
        </Button>
      </div>

    </div>
  );
}