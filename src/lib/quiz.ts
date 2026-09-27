export type PropsQuiz = {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
};

export function validarQuiz({ pregunta, opciones, correcta, explicacion }: PropsQuiz): string[] {
  const errores: string[] = [];
  if (!pregunta?.trim()) errores.push("falta 'pregunta'");

  const total = Array.isArray(opciones) ? opciones.length : 0;
  if (total < 2 || total > 4) {
    errores.push("'opciones' debe tener entre 2 y 4 elementos");
  } else if (opciones.some((o) => typeof o !== "string" || !o.trim())) {
    errores.push("hay una opción vacía");
  }

  if (!Number.isInteger(correcta) || correcta < 0 || correcta >= total) {
    errores.push(`'correcta' debe ser un índice entre 0 y ${Math.max(total - 1, 0)}`);
  }
  if (!explicacion?.trim()) errores.push("falta 'explicacion'");
  return errores;
}
