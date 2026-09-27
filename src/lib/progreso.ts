export const CLAVE_PROGRESO = "sol-a-sol:progreso";
export const EVENTO_PROGRESO = "sol-a-sol:progreso-cambio";

export type Progreso = { version: 1; completadas: string[] };
export type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function vacio(): Progreso {
  return { version: 1, completadas: [] };
}

export function obtenerAlmacen(): Almacen | null {
  try {
    if (typeof window === "undefined") return null;
    const almacen = window.localStorage;
    const prueba = "__sol-a-sol-prueba__";
    almacen.setItem(prueba, prueba);
    almacen.removeItem(prueba);
    return almacen;
  } catch {
    return null;
  }
}

export function parsearProgreso(crudo: string | null): Progreso {
  if (!crudo) return vacio();
  try {
    const datos = JSON.parse(crudo);
    const valido =
      datos?.version === 1 &&
      Array.isArray(datos.completadas) &&
      datos.completadas.every((id: unknown) => typeof id === "string");
    return valido ? { version: 1, completadas: [...new Set<string>(datos.completadas)] } : vacio();
  } catch {
    return vacio();
  }
}

function notificar() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_PROGRESO));
}

export function leerProgreso(almacen: Almacen | null = obtenerAlmacen()): Progreso {
  if (!almacen) return vacio();
  try {
    return parsearProgreso(almacen.getItem(CLAVE_PROGRESO));
  } catch {
    return vacio();
  }
}

export function marcarCompletada(id: string, almacen: Almacen | null = obtenerAlmacen()): Progreso {
  const actual = leerProgreso(almacen);
  if (actual.completadas.includes(id)) return actual;
  const nuevo: Progreso = { version: 1, completadas: [...actual.completadas, id] };
  try {
    almacen?.setItem(CLAVE_PROGRESO, JSON.stringify(nuevo));
  } catch {
    // Sin almacenamiento disponible: el avance no se recuerda, pero la app sigue funcionando.
  }
  notificar();
  return nuevo;
}

export function reiniciarProgreso(almacen: Almacen | null = obtenerAlmacen()): Progreso {
  try {
    almacen?.removeItem(CLAVE_PROGRESO);
  } catch {
    // Igual que arriba: nada que borrar si el almacenamiento está bloqueado.
  }
  notificar();
  return vacio();
}
