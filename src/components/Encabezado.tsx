import Link from "next/link";
import { Vicu } from "@/components/Vicu";

export function Encabezado() {
  return (
    <header className="border-b border-borde bg-superficie">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-primario">
          <Vicu className="h-9 w-9" />
          Sol a Sol
        </Link>
        <nav aria-label="Principal">
          <Link href="/acerca" className="rounded-lg px-3 py-2 font-semibold text-texto-suave hover:bg-fondo">
            Acerca
          </Link>
        </nav>
      </div>
    </header>
  );
}
