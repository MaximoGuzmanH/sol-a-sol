"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CLAVE_PROGRESO, EVENTO_PROGRESO, parsearProgreso, type Progreso } from "./progreso";

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO_PROGRESO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO_PROGRESO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

function leerCrudo(): string {
  try {
    return window.localStorage.getItem(CLAVE_PROGRESO) ?? "";
  } catch {
    return "";
  }
}

export function useProgreso(): Progreso {
  const crudo = useSyncExternalStore(suscribir, leerCrudo, () => "");
  return useMemo(() => parsearProgreso(crudo), [crudo]);
}
