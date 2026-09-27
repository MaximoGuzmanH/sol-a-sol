import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Encabezado } from "@/components/Encabezado";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Sol a Sol — Educación financiera para el Perú", template: "%s · Sol a Sol" },
  description: "Aprende a manejar tu dinero con clases cortas pensadas para el Perú.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={nunito.variable}>
      <body className="min-h-dvh bg-fondo font-sans text-texto antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2"
        >
          Saltar al contenido
        </a>
        <Encabezado />
        <main id="contenido" className="mx-auto max-w-3xl px-4 py-8">
          {children}
        </main>
        <footer className="mx-auto max-w-3xl px-4 pb-10 text-sm text-texto-suave">
          Sol a Sol es un proyecto educativo y gratuito. No es asesoría financiera.
        </footer>
      </body>
    </html>
  );
}
