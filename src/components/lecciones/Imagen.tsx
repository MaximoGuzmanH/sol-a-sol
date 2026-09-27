type Props = { src: string; alt: string; ancho?: number; alto?: number };

export function Imagen({ src, alt, ancho, alto }: Props) {
  if (!alt?.trim()) {
    throw new Error(`[contenido] <Imagen src="${src}"> necesita un texto alternativo (alt)`);
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ilustraciones SVG locales, no necesitan optimización
    <img src={src} alt={alt} width={ancho} height={alto} className="mx-auto h-auto max-w-full" />
  );
}
