import Link from "next/link";
import { Vicu } from "@/components/Vicu";

const PROXIMAMENTE = [
  { nombre: "Jóvenes", icono: "🧑‍🎓" },
  { nombre: "Adultos", icono: "👩‍💼" },
];

export default function Portada() {
  return (
    <div className="text-center">
      <Vicu className="mx-auto h-28 w-28" />
      <h1 className="mt-4 text-4xl font-extrabold">Aprende a manejar tu plata, sol a sol</h1>
      <p className="mt-3 text-lg text-texto-suave">Clases cortas de educación financiera pensadas para el Perú. Elige tu grupo:</p>

      <ul className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        <li>
          <Link
            href="/ninos"
            className="flex h-full flex-col rounded-3xl border-2 border-primario bg-superficie p-5 hover:bg-aviso-suave"
          >
            <span aria-hidden="true" className="text-4xl">🧒</span>
            <span className="mt-2 text-2xl font-extrabold">Niños</span>
            <span className="text-texto-suave">8 a 12 años</span>
          </Link>
        </li>
        {PROXIMAMENTE.map((grupo) => (
          <li key={grupo.nombre}>
            <div className="flex h-full flex-col rounded-3xl border-2 border-dashed border-borde bg-superficie p-5 opacity-80">
              <span aria-hidden="true" className="text-4xl">{grupo.icono}</span>
              <span className="mt-2 text-2xl font-extrabold">{grupo.nombre}</span>
              <span className="text-texto-suave">Próximamente</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
