import { Vicu } from "@/components/Vicu";

export function Personaje({ children }: { children: React.ReactNode }) {
  return (
    <aside aria-label="Vicu dice" className="flex items-start gap-3">
      <Vicu className="h-14 w-14 shrink-0" />
      <div className="rounded-2xl rounded-tl-none border-2 border-borde bg-superficie px-4 py-3 text-lg">{children}</div>
    </aside>
  );
}
