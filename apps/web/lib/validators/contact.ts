import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(6, "Teléfono inválido"),
  status: z.enum(["new", "active", "inactive", "archived"]),
  // assignedToId: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const statusOptions = [
  { label: "Nuevo", value: "new" },
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
  { label: "Archivado", value: "archived" },
];