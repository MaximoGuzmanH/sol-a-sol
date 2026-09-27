import Link from "next/link";
import { Vicu } from "@/components/Vicu";

export default function NoEncontrado() {
  return (
    <div className="text-center">
      <Vicu className="mx-auto h-24 w-24" />
      <h1 className="mt-4 text-3xl font-extrabold">¡Uy! Esta página no existe</h1>
      <p className="mt-2 text-lg text-texto-suave">Vicu buscó por todas partes y no la encontró.</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-primario px-5 py-3 text-lg font-bold text-white hover:bg-primario-oscuro"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
