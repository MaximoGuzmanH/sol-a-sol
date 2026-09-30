// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { obtenerLeccion, obtenerModulo, obtenerModulos, slugDesdeNombre } from "./contenido";

function crearContenido(archivos: Record<string, string>): string {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "sol-a-sol-"));
  for (const [ruta, texto] of Object.entries(archivos)) {
    const destino = path.join(base, ruta);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, texto);
  }
  return base;
}

const QUIZ = `<Quiz pregunta="¿?" opciones={["a", "b"]} correcta={0} explicacion="Porque sí." />`;

function leccion(orden: number, { titulo = `Lección ${orden}`, cuerpo = `Texto.\n\n${QUIZ}\n` } = {}) {
  return `---\ntitulo: "${titulo}"\nresumen: "Resumen"\nduracion: 5\norden: ${orden}\nfuentes:\n  - "SBS"\n---\n\n${cuerpo}`;
}

function modulo(orden: number, titulo = `Módulo ${orden}`) {
  return JSON.stringify({ titulo, descripcion: "Descripción", orden, icono: "🪙" });
}

describe("slugDesdeNombre", () => {
  it("quita el prefijo numérico y la extensión", () => {
    expect(slugDesdeNombre("03-ahorrar")).toBe("ahorrar");
    expect(slugDesdeNombre("01-el-chanchito.mdx")).toBe("el-chanchito");
  });
});

describe("obtenerModulos", () => {
  it("ordena módulos y lecciones por el campo orden, no por el nombre", () => {
    const base = crearContenido({
      "ninos/01-segundo/modulo.json": modulo(2, "Segundo"),
      "ninos/01-segundo/01-x.mdx": leccion(1),
      "ninos/02-primero/modulo.json": modulo(1, "Primero"),
      "ninos/02-primero/01-b.mdx": leccion(2, { titulo: "B" }),
      "ninos/02-primero/02-a.mdx": leccion(1, { titulo: "A" }),
    });
    const modulos = obtenerModulos("ninos", base);
    expect(modulos.map((m) => m.slug)).toEqual(["primero", "segundo"]);
    expect(modulos[0].lecciones.map((l) => l.titulo)).toEqual(["A", "B"]);
    expect(modulos[0].lecciones[0].id).toBe("ninos/primero/a");
    expect(modulos[0].lecciones[0]).not.toHaveProperty("cuerpo");
  });

  it("ignora archivos que no son .mdx", () => {
    const base = crearContenido({
      "ninos/01-m/modulo.json": modulo(1),
      "ninos/01-m/01-a.mdx": leccion(1),
      "ninos/01-m/notas.txt": "borrador",
    });
    expect(obtenerModulos("ninos", base)[0].lecciones).toHaveLength(1);
  });

  it("falla con el archivo y el campo si la cabecera es inválida", () => {
    const base = crearContenido({
      "ninos/01-m/modulo.json": modulo(1),
      "ninos/01-m/01-a.mdx": "---\nresumen: \"R\"\nduracion: 5\norden: 1\nfuentes:\n  - \"SBS\"\n---\n\n" + QUIZ,
    });
    expect(() => obtenerModulos("ninos", base)).toThrow(/01-a\.mdx.*titulo/);
  });

  it("falla si una lección no tiene exactamente un Quiz", () => {
    const sinQuiz = crearContenido({ "ninos/01-m/modulo.json": modulo(1), "ninos/01-m/01-a.mdx": leccion(1, { cuerpo: "Sin quiz." }) });
    expect(() => obtenerModulos("ninos", sinQuiz)).toThrow(/exactamente un <Quiz>.*tiene 0/);

    const dosQuiz = crearContenido({ "ninos/01-m/modulo.json": modulo(1), "ninos/01-m/01-a.mdx": leccion(1, { cuerpo: `${QUIZ}\n\n${QUIZ}` }) });
    expect(() => obtenerModulos("ninos", dosQuiz)).toThrow(/tiene 2/);
  });

  it("falla si falta modulo.json o no es JSON válido", () => {
    const sinModulo = crearContenido({ "ninos/01-m/01-a.mdx": leccion(1) });
    expect(() => obtenerModulos("ninos", sinModulo)).toThrow(/modulo\.json.*falta/);

    const roto = crearContenido({ "ninos/01-m/modulo.json": "{ no es json", "ninos/01-m/01-a.mdx": leccion(1) });
    expect(() => obtenerModulos("ninos", roto)).toThrow(/JSON válido/);
  });

  it("falla si dos lecciones repiten orden o slug", () => {
    const orden = crearContenido({ "ninos/01-m/modulo.json": modulo(1), "ninos/01-m/01-a.mdx": leccion(1), "ninos/01-m/02-b.mdx": leccion(1) });
    expect(() => obtenerModulos("ninos", orden)).toThrow(/'orden' 1 repetido/);

    const slug = crearContenido({ "ninos/01-m/modulo.json": modulo(1), "ninos/01-m/01-a.mdx": leccion(1), "ninos/01-m/02-a.mdx": leccion(2) });
    expect(() => obtenerModulos("ninos", slug)).toThrow(/slug "a" repetido/);
  });

  it("falla si el grupo no existe", () => {
    expect(() => obtenerModulos("jovenes", crearContenido({}))).toThrow(/no existe la carpeta del grupo/);
  });
});

describe("obtenerModulo / obtenerLeccion", () => {
  const base = crearContenido({
    "ninos/03-ahorrar/modulo.json": modulo(1, "Ahorrar"),
    "ninos/03-ahorrar/01-el-chanchito.mdx": leccion(1, { titulo: "El chanchito" }),
  });

  it("encuentra un módulo por slug", () => {
    expect(obtenerModulo("ninos", "ahorrar", base)?.titulo).toBe("Ahorrar");
    expect(obtenerModulo("ninos", "no-existe", base)).toBeUndefined();
  });

  it("devuelve la lección con su cuerpo sin cabecera", () => {
    const l = obtenerLeccion("ninos", "ahorrar", "el-chanchito", base);
    expect(l?.id).toBe("ninos/ahorrar/el-chanchito");
    expect(l?.cuerpo).toContain("<Quiz");
    expect(l?.cuerpo).not.toContain("titulo:");
    expect(obtenerLeccion("ninos", "ahorrar", "otra", base)).toBeUndefined();
  });
});

describe("contenido real de contenido/ninos", () => {
  it("carga sin lanzar: 3 módulos, 8 lecciones en total, ids únicos y fuentes con URL http", () => {
    const modulos = obtenerModulos("ninos");
    expect(modulos).toHaveLength(3);

    const lecciones = modulos.flatMap((m) => m.lecciones);
    expect(lecciones).toHaveLength(8);

    const ids = lecciones.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const l of lecciones) {
      expect(l.fuentes.length).toBeGreaterThan(0);
      for (const fuente of l.fuentes) expect(fuente).toMatch(/https?:\/\//);
    }
  });
});
