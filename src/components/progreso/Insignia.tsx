import { Vicu } from "@/components/Vicu";

export function Insignia({ modulo }: { modulo: string }) {
  return (
    <span className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-acento bg-aviso-suave px-3 py-1 text-sm font-extrabold">
      <Vicu className="h-6 w-6" />
      Insignia: {modulo}
    </span>
  );
}
