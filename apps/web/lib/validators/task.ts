import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(3, "El título es obligatorio"),
  dueDate: z.string().min(1, "La fecha es obligatoria"),
  contactId: z.string().uuid("Selecciona un contacto válido"),
  description: z.string().optional(),
  //status: z.enum(["pending", "in_progress", "done", "cancelled"])

});

export type TaskFormValues = z.infer<typeof taskSchema>;