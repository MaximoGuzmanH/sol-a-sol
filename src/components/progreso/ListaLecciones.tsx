"use client";

import Link from "next/link";
import type { Modulo } from "@/lib/contenido";
import { useProgreso } from "@/lib/useProgreso";
import { BarraProgreso } from "./BarraProgreso";
import { Insignia } from "./Insignia";

export function ListaLecciones({ grupo, modulo }: { grupo: string; modulo: Modulo }) {
  const { completadas } = useProgreso();
  const hechas = new Set(completadas);
  const total = modulo.lecciones.length;
  const n = modulo.lecciones.filter((l) => hechas.has(l.id)).length;

  return (
    <div>
      <BarraProgreso hechas={n} total={total} />
      {total > 0 && n === total && <Insignia modulo={modulo.titulo} />}
      <ol className="mt-6 grid gap-3">
        {modulo.lecciones.map((leccion, i) => {
          const lista = hechas.has(leccion.id);
          return (
            <li key={leccion.slug}>
              <Link
                href={`/${grupo}/${modulo.slug}/${leccion.slug}`}
                className="flex items-center gap-4 rounded-2xl border-2 border-borde bg-superficie p-4 hover:border-primario"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-extrabold ${
                    lista ? "bg-exito text-white" : "bg-fondo text-texto-suave"
                  }`}
                >
                  {lista ? "✓" : i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold">{leccion.titulo}</span>
                  <span className="block text-texto-suave">
                    {leccion.resumen} · {leccion.duracion} min
                  </span>
                </span>
                {lista && <span className="sr-only">(completada)</span>}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
