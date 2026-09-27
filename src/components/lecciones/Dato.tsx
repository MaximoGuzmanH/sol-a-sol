export function Dato({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-l-8 border-acento bg-aviso-suave px-4 py-3">
      <p className="text-sm font-extrabold uppercase tracking-wide text-texto-suave">
        <span aria-hidden="true">💡 </span>
        <span>Idea clave</span>
      </p>
      <div className="mt-1 text-lg font-bold">{children}</div>
    </div>
  );
}
