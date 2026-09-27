import { describe, expect, it, vi } from "vitest";
import {
  CLAVE_PROGRESO,
  EVENTO_PROGRESO,
  leerProgreso,
  marcarCompletada,
  parsearProgreso,
  reiniciarProgreso,
  type Almacen,
} from "./progreso";

function almacenFalso(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial));
  const almacen: Almacen = {
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => {
      datos.set(k, v);
    },
    removeItem: (k) => {
      datos.delete(k);
    },
  };
  return { almacen, datos };
}

const almacenRoto: Almacen = {
  getItem: () => {
    throw new Error("bloqueado");
  },
  setItem: () => {
    throw new Error("bloqueado");
  },
  removeItem: () => {
    throw new Error("bloqueado");
  },
};

const VACIO = { version: 1, completadas: [] };

describe("parsearProgreso", () => {
  it("devuelve progreso vacío ante datos ausentes, corruptos o de otra versión", () => {
    expect(parsearProgreso(null)).toEqual(VACIO);
    expect(parsearProgreso("")).toEqual(VACIO);
    expect(parsearProgreso("{no es json")).toEqual(VACIO);
    expect(parsearProgreso(JSON.stringify({ version: 2, completadas: ["a"] }))).toEqual(VACIO);
    expect(parsearProgreso(JSON.stringify({ version: 1, completadas: "a" }))).toEqual(VACIO);
    expect(parsearProgreso(JSON.stringify({ version: 1, completadas: [1] }))).toEqual(VACIO);
  });

  it("lee progreso válido y elimina duplicados", () => {
    expect(parsearProgreso(JSON.stringify({ version: 1, completadas: ["a", "a", "b"] }))).toEqual({
      version: 1,
      completadas: ["a", "b"],
    });
  });
});

describe("marcarCompletada / leerProgreso / reiniciarProgreso", () => {
  it("guarda una lección completada una sola vez", () => {
    const { almacen, datos } = almacenFalso();
    marcarCompletada("ninos/ahorrar/el-chanchito", almacen);
    marcarCompletada("ninos/ahorrar/el-chanchito", almacen);
    expect(leerProgreso(almacen).completadas).toEqual(["ninos/ahorrar/el-chanchito"]);
    expect(JSON.parse(datos.get(CLAVE_PROGRESO)!)).toEqual({ version: 1, completadas: ["ninos/ahorrar/el-chanchito"] });
  });

  it("reinicia el progreso", () => {
    const { almacen } = almacenFalso({ [CLAVE_PROGRESO]: JSON.stringify({ version: 1, completadas: ["a"] }) });
    expect(reiniciarProgreso(almacen)).toEqual(VACIO);
    expect(leerProgreso(almacen)).toEqual(VACIO);
  });

  it("funciona sin almacenamiento y con almacenamiento bloqueado sin lanzar errores", () => {
    expect(leerProgreso(null)).toEqual(VACIO);
    expect(marcarCompletada("a", null).completadas).toEqual(["a"]);
    expect(() => marcarCompletada("a", almacenRoto)).not.toThrow();
    expect(leerProgreso(almacenRoto)).toEqual(VACIO);
    expect(() => reiniciarProgreso(almacenRoto)).not.toThrow();
  });

  it("avisa a la página cuando el progreso cambia", () => {
    const escucha = vi.fn();
    window.addEventListener(EVENTO_PROGRESO, escucha);
    const { almacen } = almacenFalso();
    marcarCompletada("a", almacen);
    reiniciarProgreso(almacen);
    window.removeEventListener(EVENTO_PROGRESO, escucha);
    expect(escucha).toHaveBeenCalledTimes(2);
  });
});
