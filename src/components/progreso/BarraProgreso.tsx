export function BarraProgreso({ hechas, total }: { hechas: number; total: number }) {
  const porcentaje = total === 0 ? 0 : Math.round((hechas / total) * 100);
  const texto = `${hechas} de ${total} lecciones`;
  return (
    <div className="mt-3">
      <div
        role="progressbar"
        aria-label={texto}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={hechas}
        className="h-3 overflow-hidden rounded-full bg-borde"
      >
        <div className="h-full rounded-full bg-exito" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="mt-1 text-sm font-semibold text-texto-suave">{texto}</p>
    </div>
  );
}
