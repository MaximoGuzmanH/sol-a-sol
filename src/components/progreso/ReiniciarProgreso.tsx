"use client";

import { useState } from "react";
import { reiniciarProgreso } from "@/lib/progreso";
import { useProgreso } from "@/lib/useProgreso";

const BOTON = "min-h-12 rounded-2xl border-2 px-4 py-2 font-bold";

export function ReiniciarProgreso() {
  const { completadas } = useProgreso();
  const [confirmando, setConfirmando] = useState(false);

  if (completadas.length === 0) return null;

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className={`${BOTON} border-borde bg-superficie text-texto-suave`}>
        Empezar de nuevo
      </button>
    );
  }

  return (
    <div role="group" aria-label="Confirmar reinicio" className="rounded-2xl border-2 border-primario bg-aviso-suave p-4">
      <p className="text-lg font-bold">¿Seguro? Se borrará todo tu avance y tus insignias.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            reiniciarProgreso();
            setConfirmando(false);
          }}
          className={`${BOTON} border-primario bg-primario text-white`}
        >
          Sí, borrar
        </button>
        <button type="button" onClick={() => setConfirmando(false)} className={`${BOTON} border-borde bg-superficie`}>
          No, volver
        </button>
      </div>
    </div>
  );
}
