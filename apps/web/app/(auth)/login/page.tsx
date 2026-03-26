
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Card className="space-y-6 p-6">
      {/* HEADER (Estático, Server Side) */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-xl font-semibold">StartupCRM</p>
        <p className="text-sm text-gray-500">Tu centro de operaciones de ventas</p>
      </div>

      {/* FORMULARIO (Interactive, Client Side) */}
      <LoginForm />

      {/* FOOTER (Estático) */}
      <p className="text-center text-xs text-gray-500">
        ¿Primera vez? Este es tu primer login — configuraremos tus canales ahora.
      </p>
      <p className="text-center text-xs text-gray-500">
        <Link href="/register" className="text-[var(--brand)] font-medium hover:underline">
          Si no tienes cuenta - Registrate aquí
        </Link>
      </p>
    </Card>
  );
}