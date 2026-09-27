export function ParaAdultos({ children }: { children: React.ReactNode }) {
  return (
    <details className="rounded-2xl border-2 border-dashed border-borde bg-superficie px-4 py-3">
      <summary className="cursor-pointer text-lg font-bold text-primario">
        <span aria-hidden="true">👨‍👩‍👧 </span>
        <span>Para papás y profes</span>
      </summary>
      <div className="leccion mt-3">{children}</div>
    </details>
  );
}
