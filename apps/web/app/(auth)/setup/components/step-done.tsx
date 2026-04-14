"use client";
import { useRouter } from "next/navigation";
import ProgressSteps from "./progress-steps";
import { Button } from "@/components/ui/button";

export default function StepDone() {
  const router = useRouter();
  return (
    <div className="space-y-6 text-center">

      {/* PROGRESS */}
      <ProgressSteps step={3} />

      {/* SUCCESS ICON */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-100 border border-green-200">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="green"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p className="text-lg font-semibold">
          Todo listo
        </p>

        <p className="text-sm text-gray-500">
          Tus canales están conectados.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="bg-[var(--bg-2)] rounded-lg p-4 text-left space-y-3">

        {/* WHATSAPP */}
        <div className="flex items-center gap-2">
          <span className="text-green-600">🟢</span>

          <span className="text-sm flex-1">
            WhatsApp
          </span>

          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
            +57 11111111
          </span>
        </div>

        {/* EMAIL */}
        <div className="flex items-center gap-2">
          <span className="text-blue-600">📧</span>

          <span className="text-sm flex-1">
            Correo
          </span>

          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            Gmail conectado
          </span>
        </div>

      </div>

      {/* CTA */}
      <Button onClick={() => router.push("/dashboard")} className="w-full bg-[var(--brand)]">
        Entrar al CRM →
      </Button>

    </div>
  );
}