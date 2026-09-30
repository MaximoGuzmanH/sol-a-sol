import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca",
  description: "Qué es Sol a Sol, cómo se hace el contenido y qué fuentes usa.",
};

export default function Acerca() {
  return (
    <div className="leccion mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold">Acerca de Sol a Sol</h1>
      <p>
        Sol a Sol es una app gratuita para aprender educación financiera con ejemplos del Perú. Empezamos con
        lecciones para niños de 8 a 12 años. Pronto habrá contenido para jóvenes y adultos.
      </p>

      <h2>¿Cómo se hace el contenido?</h2>
      <p>
        Cada lección se basa en materiales públicos de instituciones peruanas y lista sus fuentes al final. Antes
        de publicarse, una persona revisa cada lección.
      </p>

      <h2>Fuentes principales</h2>
      <ul>
        <li>
          <a href="https://www.sbs.gob.pe" className="font-bold text-primario underline">
            SBS – Superintendencia de Banca, Seguros y AFP
          </a>
        </li>
        <li>
          <a href="https://www.bcrp.gob.pe" className="font-bold text-primario underline">
            BCRP – Banco Central de Reserva del Perú
          </a>
        </li>
      </ul>

      <h2>Importante</h2>
      <p>
        Sol a Sol es un proyecto educativo: <strong>no es asesoría financiera</strong>. Para decisiones sobre tu dinero, consulta los canales de orientación gratuita de la SBS (www.sbs.gob.pe).
      </p>

      <h2>Tu privacidad</h2>
      <p>
        No pedimos cuentas ni datos personales. Tu avance se guarda solo en este navegador y puedes borrarlo
        cuando quieras con el botón &quot;Empezar de nuevo&quot;.
      </p>
    </div>
  );
}
