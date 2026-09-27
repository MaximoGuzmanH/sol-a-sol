import { describe, expect, it } from "vitest";
import { esquemaLeccion, esquemaModulo, formatearErrores } from "./esquemas";

const cabeceraValida = { titulo: "El chanchito", resumen: "Ahorrar es guardar.", duracion: 5, orden: 1, fuentes: ["SBS"] };
const moduloValido = { titulo: "Ahorrar", descripcion: "Guarda hoy.", orden: 3, icono: "🐷" };

describe("esquemaLeccion", () => {
  it("acepta una cabecera completa", () => {
    expect(esquemaLeccion.safeParse(cabeceraValida).success).toBe(true);
  });

  it("rechaza una cabecera sin título e indica el campo", () => {
    const r = esquemaLeccion.safeParse({ ...cabeceraValida, titulo: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(formatearErrores(r.error)).toMatch(/titulo/);
  });

  it("rechaza una lección sin fuentes", () => {
    expect(esquemaLeccion.safeParse({ ...cabeceraValida, fuentes: [] }).success).toBe(false);
  });

  it("rechaza orden 0 y duración no entera", () => {
    expect(esquemaLeccion.safeParse({ ...cabeceraValida, orden: 0 }).success).toBe(false);
    expect(esquemaLeccion.safeParse({ ...cabeceraValida, duracion: 4.5 }).success).toBe(false);
  });
});

describe("esquemaModulo", () => {
  it("acepta un módulo completo", () => {
    expect(esquemaModulo.safeParse(moduloValido).success).toBe(true);
  });

  it("rechaza un módulo sin ícono", () => {
    const r = esquemaModulo.safeParse({ ...moduloValido, icono: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(formatearErrores(r.error)).toMatch(/icono/);
  });
});
