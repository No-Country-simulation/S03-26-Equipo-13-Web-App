import { z } from "zod";

// LOGIN
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// REGISTER
export const registerSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio (min 2 caracteres)"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  // El role es opcional ** ver back , tiene que estar definido
  role: z.string().optional(), 
});

export type RegisterInput = z.infer<typeof registerSchema>;