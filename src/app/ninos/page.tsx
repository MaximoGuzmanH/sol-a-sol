import type { Metadata } from "next";
import { Personaje } from "@/components/lecciones/Personaje";
import { MapaModulos } from "@/components/progreso/MapaModulos";
import { obtenerModulos } from "@/lib/contenido";

export const metadata: Metadata = {
  title: "Niños",
  description: "Lecciones cortas sobre el dinero para niños de 8 a 12 años.",
};

export default function PaginaNinos() {
  const modulos = obtenerModulos("ninos");
  return (
    <>
      <h1 className="text-3xl font-extrabold">¡Hola! Aprendamos sobre el dinero</h1>
      <div className="mt-4">
        <Personaje>Soy Vicu. Elige un módulo y empecemos. ¡Cada lección dura unos 5 minutos!</Personaje>
      </div>
      <div className="mt-8">
        <MapaModulos grupo="ninos" modulos={modulos} />
      </div>
    </>
  );
}
