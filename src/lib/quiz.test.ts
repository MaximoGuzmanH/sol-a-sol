import { describe, expect, it } from "vitest";
import { validarQuiz } from "./quiz";

const valido = { pregunta: "¿Qué es ahorrar?", opciones: ["Gastar", "Guardar", "Perder"], correcta: 1, explicacion: "Guardar es ahorrar." };

describe("validarQuiz", () => {
  it("no devuelve errores para un quiz válido", () => {
    expect(validarQuiz(valido)).toEqual([]);
  });

  it("rechaza menos de 2 y más de 4 opciones", () => {
    expect(validarQuiz({ ...valido, opciones: ["Una"], correcta: 0 })).toContainEqual(expect.stringMatching(/entre 2 y 4/));
    expect(validarQuiz({ ...valido, opciones: ["a", "b", "c", "d", "e"], correcta: 0 })).toContainEqual(expect.stringMatching(/entre 2 y 4/));
  });

  it("rechaza una respuesta correcta fuera de rango o no entera", () => {
    expect(validarQuiz({ ...valido, correcta: 3 })).toContainEqual(expect.stringMatching(/correcta/));
    expect(validarQuiz({ ...valido, correcta: -1 })).toContainEqual(expect.stringMatching(/correcta/));
    expect(validarQuiz({ ...valido, correcta: 1.5 })).toContainEqual(expect.stringMatching(/correcta/));
  });

  it("rechaza opciones, pregunta o explicación vacías", () => {
    expect(validarQuiz({ ...valido, opciones: ["a", " "] })).toContainEqual(expect.stringMatching(/opción vacía/));
    expect(validarQuiz({ ...valido, pregunta: "" })).toContainEqual(expect.stringMatching(/pregunta/));
    expect(validarQuiz({ ...valido, explicacion: "" })).toContainEqual(expect.stringMatching(/explicacion/));
  });
});
