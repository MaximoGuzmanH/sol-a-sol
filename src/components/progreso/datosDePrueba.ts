import type { Modulo } from "@/lib/contenido";

export function moduloDePrueba(cantidad = 2): Modulo {
  return {
    titulo: "Ahorrar",
    descripcion: "Guarda hoy para tus metas.",
    orden: 1,
    icono: "🐷",
    slug: "ahorrar",
    grupo: "ninos",
    lecciones: Array.from({ length: cantidad }, (_, i) => ({
      id: `ninos/ahorrar/l${i + 1}`,
      slug: `l${i + 1}`,
      grupo: "ninos",
      moduloSlug: "ahorrar",
      titulo: `Lección ${i + 1}`,
      resumen: "Resumen",
      duracion: 5,
      orden: i + 1,
      fuentes: ["SBS"],
    })),
  };
}
