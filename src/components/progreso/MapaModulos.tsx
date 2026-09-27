"use client";

import Link from "next/link";
import type { Modulo } from "@/lib/contenido";
import { useProgreso } from "@/lib/useProgreso";
import { BarraProgreso } from "./BarraProgreso";
import { Insignia } from "./Insignia";
import { ReiniciarProgreso } from "./ReiniciarProgreso";

export function MapaModulos({ grupo, modulos }: { grupo: string; modulos: Modulo[] }) {
  const { completadas } = useProgreso();
  const hechas = new Set(completadas);

  return (
    <div>
      <ol className="grid gap-4">
        {modulos.map((modulo) => {
          const total = modulo.lecciones.length;
          const n = modulo.lecciones.filter((l) => hechas.has(l.id)).length;
          return (
            <li key={modulo.slug}>
              <Link
                href={`/${grupo}/${modulo.slug}`}
                className="block rounded-3xl border-2 border-borde bg-superficie p-5 hover:border-primario"
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-4xl">
                    {modulo.icono}
                  </span>
                  <span className="text-2xl font-extrabold">{modulo.titulo}</span>
                </span>
                <span className="mt-2 block text-lg text-texto-suave">{modulo.descripcion}</span>
                <BarraProgreso hechas={n} total={total} />
                {total > 0 && n === total && <Insignia modulo={modulo.titulo} />}
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-8">
        <ReiniciarProgreso />
      </div>
    </div>
  );
}
