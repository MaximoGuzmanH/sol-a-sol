import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  esquemaLeccion,
  esquemaModulo,
  formatearErrores,
  type CabeceraLeccion,
  type DatosModulo,
} from "./esquemas";

export const DIRECTORIO_CONTENIDO = path.join(process.cwd(), "contenido");

export type ResumenLeccion = CabeceraLeccion & { id: string; slug: string; grupo: string; moduloSlug: string };
export type Leccion = ResumenLeccion & { cuerpo: string };
export type Modulo = DatosModulo & { slug: string; grupo: string; lecciones: ResumenLeccion[] };

type ModuloCargado = { modulo: Modulo; lecciones: Leccion[] };

export class ErrorDeContenido extends Error {
  constructor(ruta: string, detalle: string) {
    super(`[contenido] ${ruta}: ${detalle}`);
    this.name = "ErrorDeContenido";
  }
}

export function slugDesdeNombre(nombre: string): string {
  return nombre.replace(/\.mdx$/, "").replace(/^\d+-/, "");
}

function verificarUnicos(items: { orden: number; slug: string }[], ruta: string) {
  const ordenes = new Map<number, string>();
  const slugs = new Set<string>();
  for (const item of items) {
    const previo = ordenes.get(item.orden);
    if (previo) throw new ErrorDeContenido(ruta, `'orden' ${item.orden} repetido en "${previo}" y "${item.slug}"`);
    if (slugs.has(item.slug)) throw new ErrorDeContenido(ruta, `slug "${item.slug}" repetido`);
    ordenes.set(item.orden, item.slug);
    slugs.add(item.slug);
  }
}

function leerLeccion(base: string, grupo: string, moduloSlug: string, archivo: string): Leccion {
  const ruta = path.relative(base, archivo);
  const { data, content } = matter(fs.readFileSync(archivo, "utf8"));
  const cabecera = esquemaLeccion.safeParse(data);
  if (!cabecera.success) throw new ErrorDeContenido(ruta, formatearErrores(cabecera.error));

  const quizzes = content.match(/<Quiz[\s/>]/g)?.length ?? 0;
  if (quizzes !== 1) throw new ErrorDeContenido(ruta, `debe tener exactamente un <Quiz> (tiene ${quizzes})`);

  const slug = slugDesdeNombre(path.basename(archivo));
  return { ...cabecera.data, id: `${grupo}/${moduloSlug}/${slug}`, slug, grupo, moduloSlug, cuerpo: content };
}

function resumir(l: Leccion): ResumenLeccion {
  return {
    id: l.id,
    slug: l.slug,
    grupo: l.grupo,
    moduloSlug: l.moduloSlug,
    titulo: l.titulo,
    resumen: l.resumen,
    duracion: l.duracion,
    orden: l.orden,
    fuentes: l.fuentes,
  };
}

function leerModulo(base: string, grupo: string, carpeta: string): ModuloCargado {
  const dir = path.join(base, grupo, carpeta);
  const archivoModulo = path.join(dir, "modulo.json");
  const ruta = path.relative(base, archivoModulo);
  if (!fs.existsSync(archivoModulo)) throw new ErrorDeContenido(ruta, "falta el archivo modulo.json");

  let crudo: unknown;
  try {
    crudo = JSON.parse(fs.readFileSync(archivoModulo, "utf8"));
  } catch {
    throw new ErrorDeContenido(ruta, "no es un JSON válido");
  }
  const datos = esquemaModulo.safeParse(crudo);
  if (!datos.success) throw new ErrorDeContenido(ruta, formatearErrores(datos.error));

  const slug = slugDesdeNombre(carpeta);
  const lecciones = fs
    .readdirSync(dir)
    .filter((nombre) => nombre.endsWith(".mdx"))
    .map((nombre) => leerLeccion(base, grupo, slug, path.join(dir, nombre)))
    .sort((a, b) => a.orden - b.orden);
  verificarUnicos(lecciones, path.relative(base, dir));

  return { modulo: { ...datos.data, slug, grupo, lecciones: lecciones.map(resumir) }, lecciones };
}

function cargarGrupo(grupo: string, base: string): ModuloCargado[] {
  const dir = path.join(base, grupo);
  if (!fs.existsSync(dir)) throw new ErrorDeContenido(grupo, "no existe la carpeta del grupo");
  const modulos = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => leerModulo(base, grupo, entrada.name))
    .sort((a, b) => a.modulo.orden - b.modulo.orden);
  verificarUnicos(modulos.map((m) => m.modulo), grupo);
  return modulos;
}

export function obtenerModulos(grupo: string, base = DIRECTORIO_CONTENIDO): Modulo[] {
  return cargarGrupo(grupo, base).map((m) => m.modulo);
}

export function obtenerModulo(grupo: string, moduloSlug: string, base = DIRECTORIO_CONTENIDO): Modulo | undefined {
  return obtenerModulos(grupo, base).find((m) => m.slug === moduloSlug);
}

export function obtenerLeccion(
  grupo: string,
  moduloSlug: string,
  leccionSlug: string,
  base = DIRECTORIO_CONTENIDO,
): Leccion | undefined {
  return cargarGrupo(grupo, base)
    .find((m) => m.modulo.slug === moduloSlug)
    ?.lecciones.find((l) => l.slug === leccionSlug);
}
