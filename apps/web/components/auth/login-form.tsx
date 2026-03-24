"use client"; 
//estados
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
//validacion caracteres
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validators/auth";
//compornentes
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
//authContext mantener la sesion activa 
import { useAuth } from "@/context/AuthContext"; 

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error al iniciar sesión");

      // Actualizamos el contexto global
      login(result.accessToken, result.user);
      router.push("/dashboard");
      
    } catch (error: any) {
      setServerError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
          {serverError}
        </div>
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium">Correo electrónico</p>
        <Input placeholder="tu@empresa.com" {...register("email")} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">Contraseña</p>
        <Input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-[var(--brand)]" disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Ingresar al CRM"}
      </Button>
    </form>
  );
}