import { z } from "zod";

export const esquemaLeccion = z.object({
  titulo: z.string().min(1),
  resumen: z.string().min(1),
  duracion: z.number().int().positive(),
  orden: z.number().int().min(1),
  fuentes: z.array(z.string().min(1)).min(1),
});
export type CabeceraLeccion = z.infer<typeof esquemaLeccion>;

export const esquemaModulo = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  orden: z.number().int().min(1),
  icono: z.string().min(1),
});
export type DatosModulo = z.infer<typeof esquemaModulo>;

export function formatearErrores(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`).join("; ");
}
