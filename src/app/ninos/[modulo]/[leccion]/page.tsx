import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RenderLeccion } from "@/components/lecciones/RenderLeccion";
import { obtenerLeccion, obtenerModulo, obtenerModulos } from "@/lib/contenido";

const GRUPO = "ninos";
export const dynamicParams = false;

type Params = Promise<{ modulo: string; leccion: string }>;

export function generateStaticParams() {
  return obtenerModulos(GRUPO).flatMap((m) => m.lecciones.map((l) => ({ modulo: m.slug, leccion: l.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { modulo, leccion } = await params;
  const datos = obtenerLeccion(GRUPO, modulo, leccion);
  return datos ? { title: datos.titulo, description: datos.resumen } : {};
}

export default async function PaginaLeccion({ params }: { params: Params }) {
  const { modulo: moduloSlug, leccion: leccionSlug } = await params;
  const modulo = obtenerModulo(GRUPO, moduloSlug);
  const leccion = obtenerLeccion(GRUPO, moduloSlug, leccionSlug);
  if (!modulo || !leccion) notFound();

  const indice = modulo.lecciones.findIndex((l) => l.slug === leccion.slug);
  const siguiente = modulo.lecciones[indice + 1];

  return (
    <article className="mx-auto max-w-2xl">
      <nav aria-label="Ruta" className="text-lg font-semibold">
        <Link href={`/${GRUPO}/${modulo.slug}`} className="text-primario hover:underline">
          ← {modulo.titulo}
        </Link>
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold">{leccion.titulo}</h1>
      <p className="mt-2 text-lg text-texto-suave">
        {leccion.resumen} · {leccion.duracion} min
      </p>

      <div className="leccion mt-8">
        <RenderLeccion leccion={leccion} />
      </div>

      <footer className="mt-10 border-t border-borde pt-6">
        {siguiente ? (
          <Link
            href={`/${GRUPO}/${modulo.slug}/${siguiente.slug}`}
            className="inline-flex min-h-12 items-center rounded-2xl bg-primario px-5 py-3 text-lg font-bold text-white hover:bg-primario-oscuro"
          >
            Siguiente: {siguiente.titulo} →
          </Link>
        ) : (
          <Link
            href={`/${GRUPO}/${modulo.slug}`}
            className="inline-flex min-h-12 items-center rounded-2xl bg-primario px-5 py-3 text-lg font-bold text-white hover:bg-primario-oscuro"
          >
            Volver al módulo
          </Link>
        )}
        <details className="mt-6 text-texto-suave">
          <summary className="cursor-pointer font-semibold">Fuentes</summary>
          <ul className="mt-2 list-disc pl-6">
            {leccion.fuentes.map((fuente) => (
              <li key={fuente}>{fuente}</li>
            ))}
          </ul>
        </details>
      </footer>
    </article>
  );
}
