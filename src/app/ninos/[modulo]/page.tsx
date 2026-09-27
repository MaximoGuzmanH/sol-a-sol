import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaLecciones } from "@/components/progreso/ListaLecciones";
import { obtenerModulo, obtenerModulos } from "@/lib/contenido";

const GRUPO = "ninos";
export const dynamicParams = false;

type Params = Promise<{ modulo: string }>;

export function generateStaticParams() {
  return obtenerModulos(GRUPO).map((m) => ({ modulo: m.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { modulo } = await params;
  const datos = obtenerModulo(GRUPO, modulo);
  return datos ? { title: datos.titulo, description: datos.descripcion } : {};
}

export default async function PaginaModulo({ params }: { params: Params }) {
  const { modulo: moduloSlug } = await params;
  const modulo = obtenerModulo(GRUPO, moduloSlug);
  if (!modulo) notFound();

  return (
    <>
      <nav aria-label="Ruta" className="text-lg font-semibold">
        <Link href={`/${GRUPO}`} className="text-primario hover:underline">
          ← Todos los módulos
        </Link>
      </nav>
      <h1 className="mt-4 flex items-center gap-3 text-3xl font-extrabold">
        <span aria-hidden="true">{modulo.icono}</span>
        {modulo.titulo}
      </h1>
      <p className="mt-2 text-lg text-texto-suave">{modulo.descripcion}</p>
      <div className="mt-6">
        <ListaLecciones grupo={GRUPO} modulo={modulo} />
      </div>
    </>
  );
}
