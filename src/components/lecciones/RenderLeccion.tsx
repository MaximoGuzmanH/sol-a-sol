import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { Leccion } from "@/lib/contenido";
import { validarQuiz, type PropsQuiz } from "@/lib/quiz";
import { Dato } from "./Dato";
import { Imagen } from "./Imagen";
import { ParaAdultos } from "./ParaAdultos";
import { Personaje } from "./Personaje";
import { Quiz } from "./Quiz";

export async function RenderLeccion({ leccion }: { leccion: Leccion }) {
  const { default: Contenido } = await evaluate(leccion.cuerpo, { ...(runtime as Parameters<typeof evaluate>[1]) });

  function QuizDeLeccion(props: PropsQuiz) {
    const errores = validarQuiz(props);
    if (errores.length > 0) {
      throw new Error(`[contenido] ${leccion.id}: <Quiz> inválido: ${errores.join("; ")}`);
    }
    return <Quiz {...props} leccionId={leccion.id} />;
  }

  return <Contenido components={{ Quiz: QuizDeLeccion, Personaje, Dato, ParaAdultos, Imagen }} />;
}
