
import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <Card className="space-y-6 p-6">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>

        <p className="text-xl font-semibold">
          Únete a StartupCRM
        </p>

        <p className="text-sm text-gray-500">
          Crea tu cuenta en segundos
        </p>
      </div>

      {/* FORMULARIO */}
      <RegisterForm />

      {/* FOOTER */}
      <p className="text-center text-xs text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-[var(--brand)] font-medium hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </Card>
  );
}