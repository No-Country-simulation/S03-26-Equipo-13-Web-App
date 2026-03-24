"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validators/auth"; // Importamos el nuevo validador
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Asumiendo que tienes componente Alert
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const [serverStatus, setServerStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
        name: "",
        email: "",
        password: "",
        role: "USER" // Puedes setear un rol por defecto aquí si quieres mostrarlo VER con back
    }
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerStatus(null);
    try {
      // Usamos el endpoint de registro (ajusta la URL según tu backend)
      const response = await fetch("http://localhost:3000/auth/register", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Manejo de errores de NestJS (ej: "Email already exists")
        throw new Error(result.message || "Error al registrar usuario");
      }

      // Registro exitoso
      setServerStatus({ type: 'success', message: "¡Cuenta creada con éxito! Redirigiendo al login..." });
      
      // Redireccionar al login después de 2 segundos para que vean el mensaje
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (error: any) {
      setServerStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* Mensajes del servidor */}
      {serverStatus && (
        <Alert variant={serverStatus.type === 'error' ? 'destructive' : 'default'} className={serverStatus.type === 'success' ? 'border-green-500 bg-green-50 text-green-700' : ''}>
          {serverStatus.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
          <AlertTitle>{serverStatus.type === 'error' ? 'Error' : '¡Éxito!'}</AlertTitle>
          <AlertDescription>{serverStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* NOMBRE */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Nombre Completo</p>
        <Input placeholder="Nombre Completo" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* EMAIL */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Correo electrónico</p>
        <Input placeholder="email@startup.com" {...register("email")} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* PASSWORD */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Contraseña (min. 6 caracteres)</p>
        <Input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>
      
      {/* ROLE (Opcional/Oculto) */}
      {/* Si el back asigna rol por defecto
        
      */}

      <Button
        type="submit"
        className="w-full bg-[var(--brand)]"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creando cuenta..." : "Crear mi cuenta"}
      </Button>
    </form>
  );
}