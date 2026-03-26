"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function RegisterForm() {
  const [serverStatus, setServerStatus] = useState<{
    type: 'error' | 'success',
    message: string
  } | null>(null);

  const router = useRouter();


  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
    },
  });


  async function onSubmit(data: RegisterInput) {
    setServerStatus(null);
    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al registrar usuario");
      }

      setServerStatus({
        type: 'success',
        message: "¡Cuenta creada con éxito! Redirigiendo..."
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      setServerStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Alertas de Servidor */}
        {serverStatus && (
          <Alert
            variant={serverStatus.type === 'error' ? 'destructive' : 'default'}
            className={cn(
              "items-center py-3",
              serverStatus.type === 'success' ? 'border-green-500 bg-green-50 text-green-700' : ''
            )}
          >
            {serverStatus.type === 'error' ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            )}
            <div className="flex flex-row items-center gap-2">
              <AlertTitle className="mb-0">{serverStatus.type === 'error' ? 'Error' : '¡Éxito!'}</AlertTitle>
              <AlertDescription>{serverStatus.message}</AlertDescription>
            </div>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@startup.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[var(--color-brand)]"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Crear mi cuenta"
          )}
        </Button>
      </form>
    </Form>
  );
}