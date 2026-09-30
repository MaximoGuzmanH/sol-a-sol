"use client";

import { useEffect, useId, useRef, useState } from "react";
import { marcarCompletada } from "@/lib/progreso";
import type { PropsQuiz } from "@/lib/quiz";

type Props = PropsQuiz & { leccionId: string };

export function Quiz({ pregunta, opciones, correcta, explicacion, leccionId }: Props) {
  const [elegida, setElegida] = useState<number | null>(null);
  const [intentos, setIntentos] = useState(0);
  const idPregunta = useId();
  const acerto = elegida === correcta;
  const refFeedback = useRef<HTMLParagraphElement>(null);

  function responder(indice: number) {
    setElegida(indice);
    setIntentos((n) => n + 1);
    if (indice === correcta) marcarCompletada(leccionId);
  }

  useEffect(() => {
    if (acerto) refFeedback.current?.focus();
  }, [acerto]);

  return (
    <section aria-labelledby={idPregunta} className="rounded-3xl border-2 border-primario/30 bg-superficie p-5">
      <p className="text-sm font-extrabold uppercase tracking-wide text-primario">¿Qué aprendiste?</p>
      <h2 id={idPregunta} className="mt-1 text-xl font-extrabold">
        {pregunta}
      </h2>
      <ul className="mt-4 grid gap-3">
        {opciones.map((opcion, indice) => {
          const esElegida = elegida === indice;
          const estilo = esElegida
            ? indice === correcta
              ? "border-exito bg-exito-suave"
              : "border-primario bg-aviso-suave"
            : "border-borde bg-fondo hover:border-primario";
          return (
            <li key={indice}>
              <button
                type="button"
                onClick={() => responder(indice)}
                disabled={acerto}
                aria-pressed={esElegida}
                className={`min-h-12 w-full rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition-colors disabled:cursor-default ${estilo}`}
              >
                {opcion}
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite" className="mt-4 min-h-8 text-lg">
        {elegida !== null &&
          (acerto ? (
            <p key={intentos} ref={refFeedback} tabIndex={-1} className="font-bold text-exito outline-none">
              ¡Muy bien! 🎉 {explicacion}
            </p>
          ) : (
            <p key={intentos} className="font-bold text-primario-oscuro">
              ¡Casi! Esa no es. Intenta con otra opción 💪
            </p>
          ))}
      </div>
    </section>
  );
}
