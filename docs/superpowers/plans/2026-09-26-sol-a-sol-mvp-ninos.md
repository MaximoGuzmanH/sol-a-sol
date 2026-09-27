# Sol a Sol — MVP Niños: Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar en Vercel la app Sol a Sol con el grupo Niños (8–12 años): módulos 1–3, unas 8 lecciones MDX con quiz, progreso local, insignias y sección "Para papás y profes".

**Architecture:** Next.js (App Router), 100% estático. Las lecciones son archivos MDX en `contenido/<grupo>/<NN-modulo>/`. En el build, `src/lib/contenido.ts` los lee con `gray-matter` y los valida con `zod`; el cuerpo se renderiza en un Server Component con `@mdx-js/mdx` (`evaluate`). El progreso vive en `localStorage` (`src/lib/progreso.ts`) y los componentes cliente lo leen con `useSyncExternalStore`.

**Tech Stack:** Next.js (última estable ≥ 15) · React 19 · TypeScript · Tailwind CSS v4 · @mdx-js/mdx 3 · gray-matter · zod · Vitest + Testing Library (jsdom) · Playwright · Vercel.

**Spec:** `docs/superpowers/specs/2026-09-26-sol-a-sol-mvp-ninos-design.md`

## Global Constraints

- Todo texto visible está en castellano (Perú). `<html lang="es-PE">`.
- Sin backend en runtime: no hay rutas API, base de datos, login, cookies de terceros ni analytics.
- Único grupo activo: `ninos` (8–12 años). Jóvenes y Adultos solo aparecen como "Próximamente".
- Clave de progreso: `sol-a-sol:progreso`, formato `{ "version": 1, "completadas": string[] }`.
- Id de lección: `<grupo>/<slugModulo>/<slugLeccion>`. El slug es el nombre de carpeta/archivo **sin** el prefijo numérico `NN-` (p. ej. `ninos/ahorrar/el-chanchito`). *Refinamiento sobre el ejemplo del spec: si el prefijo cambia al reordenar, no se pierde el progreso guardado.*
- Cabecera de lección obligatoria: `titulo`, `resumen`, `duracion`, `orden`, `fuentes` (≥ 1). `modulo.json`: `titulo`, `descripcion`, `orden`, `icono`.
- Cada lección tiene **exactamente un** `<Quiz>`, con 2–4 opciones y `correcta` como índice válido desde 0.
- Contenido inválido ⇒ `next build` falla con `[contenido] <archivo o id>: <detalle>`.
- Texto de lección ≥ 18px (`text-lg`), contraste WCAG AA, `alt` obligatorio, feedback del quiz con `aria-live`, respetar `prefers-reduced-motion`.
- Nunca usar `alert()`, `confirm()` ni `prompt()`. Las confirmaciones van dentro de la página.
- Contenido: no inventar datos. Todo dato concreto se verifica en la fuente oficial (SBS, BCRP) y **Máximo aprueba cada módulo antes de hacer commit**.
- Mensajes de commit en castellano y terminados en la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (se pasa como segundo `-m`).
- Comandos en Git Bash con el directorio de trabajo `C:\Users\Maximo Guzman\Documents\GitHub\sol-a-sol`.

## Mapa de archivos

```
contenido/ninos/
  01-que-es-el-dinero/{modulo.json, 01-el-trueque.mdx, 02-el-sol-peruano.mdx, 03-cuida-tus-billetes.mdx}
  02-necesidades-y-deseos/{modulo.json, 01-necesito-o-quiero.mdx, 02-cuando-no-alcanza.mdx}
  03-ahorrar/{modulo.json, 01-el-chanchito.mdx, 02-metas-de-ahorro.mdx, 03-la-junta.mdx}
src/
  app/
    layout.tsx                         # fuente, encabezado, pie, salto al contenido
    globals.css                        # tokens de color, estilos .leccion, reduced-motion
    page.tsx (+ page.test.tsx)         # portada: elegir grupo
    acerca/page.tsx (+ page.test.tsx)  # qué es, fuentes, aviso
    not-found.tsx
    ninos/page.tsx                     # mapa de módulos
    ninos/[modulo]/page.tsx            # lecciones del módulo
    ninos/[modulo]/[leccion]/page.tsx  # lección
  components/
    Vicu.tsx                           # mascota SVG
    Encabezado.tsx (+ test)
    lecciones/{Personaje, Dato, ParaAdultos, Imagen, Quiz}.tsx (+ tests)
    lecciones/RenderLeccion.tsx        # MDX → React (server)
    progreso/{BarraProgreso, Insignia, ReiniciarProgreso, MapaModulos, ListaLecciones}.tsx (+ tests)
    progreso/datosDePrueba.ts          # fábrica de Modulo para tests
  lib/
    esquemas.ts (+ test)               # zod: cabecera de lección y modulo.json
    quiz.ts (+ test)                   # validarQuiz
    contenido.ts (+ test)              # lectura y validación del contenido
    progreso.ts (+ test)               # localStorage
    useProgreso.ts                     # hook cliente
e2e/recorrido.spec.ts
vitest.config.mts, vitest.setup.ts, playwright.config.ts
```

---

### Task 1: Esqueleto Next.js

**Files:**
- Create: todo el scaffold de `create-next-app` en la raíz del repo (`package.json`, `src/app/*`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`, `.gitignore`, `public/*`)

**Interfaces:**
- Produces: proyecto Next.js con App Router, TypeScript, Tailwind v4, ESLint, carpeta `src/` y alias `@/*` → `src/*`.

- [ ] **Step 1: Generar el scaffold en una carpeta temporal**

`create-next-app` rechaza carpetas que no están vacías, así que se genera aparte y se copia.

```bash
TMP=$(mktemp -d)
cd "$TMP" && npx --yes create-next-app@latest sol-a-sol --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```
Expected: termina con "Success! Created sol-a-sol".

- [ ] **Step 2: Copiar al repo sin pisar `.git` ni `docs/`**

```bash
rm -rf "$TMP/sol-a-sol/.git" "$TMP/sol-a-sol/node_modules"
cp -rn "$TMP/sol-a-sol/." "/c/Users/Maximo Guzman/Documents/GitHub/sol-a-sol/"
cd "/c/Users/Maximo Guzman/Documents/GitHub/sol-a-sol" && npm install
```

- [ ] **Step 3: Verificar versión, build y lint**

```bash
npx next --version
npm run build
npm run lint
```
Expected: versión de Next ≥ 15 (si es menor, detenerse y avisar: el plan usa `params` como `Promise`). El build y el lint terminan sin errores.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: esqueleto Next.js con TypeScript y Tailwind" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Vitest + esquemas de contenido + validación del quiz

**Files:**
- Create: `vitest.config.mts`, `vitest.setup.ts`, `src/lib/esquemas.ts`, `src/lib/esquemas.test.ts`, `src/lib/quiz.ts`, `src/lib/quiz.test.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces:
  - `esquemaLeccion` (zod) y `type CabeceraLeccion = { titulo: string; resumen: string; duracion: number; orden: number; fuentes: string[] }`
  - `esquemaModulo` (zod) y `type DatosModulo = { titulo: string; descripcion: string; orden: number; icono: string }`
  - `formatearErrores(error: z.ZodError): string`
  - `type PropsQuiz = { pregunta: string; opciones: string[]; correcta: number; explicacion: string }`
  - `validarQuiz(props: PropsQuiz): string[]`: lista de errores, vacía si el quiz es válido

- [ ] **Step 1: Instalar dependencias**

```bash
npm install zod
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 2: Configurar Vitest**

`vitest.config.mts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

En `package.json`, agregar a `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 3: Escribir los tests que fallan**

`src/lib/esquemas.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { esquemaLeccion, esquemaModulo, formatearErrores } from "./esquemas";

const cabeceraValida = { titulo: "El chanchito", resumen: "Ahorrar es guardar.", duracion: 5, orden: 1, fuentes: ["SBS"] };
const moduloValido = { titulo: "Ahorrar", descripcion: "Guarda hoy.", orden: 3, icono: "🐷" };

describe("esquemaLeccion", () => {
  it("acepta una cabecera completa", () => {
    expect(esquemaLeccion.safeParse(cabeceraValida).success).toBe(true);
  });

  it("rechaza una cabecera sin título e indica el campo", () => {
    const r = esquemaLeccion.safeParse({ ...cabeceraValida, titulo: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(formatearErrores(r.error)).toMatch(/titulo/);
  });

  it("rechaza una lección sin fuentes", () => {
    expect(esquemaLeccion.safeParse({ ...cabeceraValida, fuentes: [] }).success).toBe(false);
  });

  it("rechaza orden 0 y duración no entera", () => {
    expect(esquemaLeccion.safeParse({ ...cabeceraValida, orden: 0 }).success).toBe(false);
    expect(esquemaLeccion.safeParse({ ...cabeceraValida, duracion: 4.5 }).success).toBe(false);
  });
});

describe("esquemaModulo", () => {
  it("acepta un módulo completo", () => {
    expect(esquemaModulo.safeParse(moduloValido).success).toBe(true);
  });

  it("rechaza un módulo sin ícono", () => {
    const r = esquemaModulo.safeParse({ ...moduloValido, icono: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(formatearErrores(r.error)).toMatch(/icono/);
  });
});
```

`src/lib/quiz.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { validarQuiz } from "./quiz";

const valido = { pregunta: "¿Qué es ahorrar?", opciones: ["Gastar", "Guardar", "Perder"], correcta: 1, explicacion: "Guardar es ahorrar." };

describe("validarQuiz", () => {
  it("no devuelve errores para un quiz válido", () => {
    expect(validarQuiz(valido)).toEqual([]);
  });

  it("rechaza menos de 2 y más de 4 opciones", () => {
    expect(validarQuiz({ ...valido, opciones: ["Una"], correcta: 0 })).toContainEqual(expect.stringMatching(/entre 2 y 4/));
    expect(validarQuiz({ ...valido, opciones: ["a", "b", "c", "d", "e"], correcta: 0 })).toContainEqual(expect.stringMatching(/entre 2 y 4/));
  });

  it("rechaza una respuesta correcta fuera de rango o no entera", () => {
    expect(validarQuiz({ ...valido, correcta: 3 })).toContainEqual(expect.stringMatching(/correcta/));
    expect(validarQuiz({ ...valido, correcta: -1 })).toContainEqual(expect.stringMatching(/correcta/));
    expect(validarQuiz({ ...valido, correcta: 1.5 })).toContainEqual(expect.stringMatching(/correcta/));
  });

  it("rechaza opciones, pregunta o explicación vacías", () => {
    expect(validarQuiz({ ...valido, opciones: ["a", " "] })).toContainEqual(expect.stringMatching(/opción vacía/));
    expect(validarQuiz({ ...valido, pregunta: "" })).toContainEqual(expect.stringMatching(/pregunta/));
    expect(validarQuiz({ ...valido, explicacion: "" })).toContainEqual(expect.stringMatching(/explicacion/));
  });
});
```

- [ ] **Step 4: Correr y verificar que fallan**

Run: `npm test`
Expected: FAIL. No se pueden resolver `./esquemas` ni `./quiz`.

- [ ] **Step 5: Implementar**

`src/lib/esquemas.ts`:
```ts
import { z } from "zod";

export const esquemaLeccion = z.object({
  titulo: z.string().min(1),
  resumen: z.string().min(1),
  duracion: z.number().int().positive(),
  orden: z.number().int().min(1),
  fuentes: z.array(z.string().min(1)).min(1),
});
export type CabeceraLeccion = z.infer<typeof esquemaLeccion>;

export const esquemaModulo = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  orden: z.number().int().min(1),
  icono: z.string().min(1),
});
export type DatosModulo = z.infer<typeof esquemaModulo>;

export function formatearErrores(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`).join("; ");
}
```

`src/lib/quiz.ts`:
```ts
export type PropsQuiz = {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
};

export function validarQuiz({ pregunta, opciones, correcta, explicacion }: PropsQuiz): string[] {
  const errores: string[] = [];
  if (!pregunta?.trim()) errores.push("falta 'pregunta'");

  const total = Array.isArray(opciones) ? opciones.length : 0;
  if (total < 2 || total > 4) {
    errores.push("'opciones' debe tener entre 2 y 4 elementos");
  } else if (opciones.some((o) => typeof o !== "string" || !o.trim())) {
    errores.push("hay una opción vacía");
  }

  if (!Number.isInteger(correcta) || correcta < 0 || correcta >= total) {
    errores.push(`'correcta' debe ser un índice entre 0 y ${Math.max(total - 1, 0)}`);
  }
  if (!explicacion?.trim()) errores.push("falta 'explicacion'");
  return errores;
}
```

- [ ] **Step 6: Correr y verificar que pasan**

Run: `npm test && npm run typecheck`
Expected: PASS (10 tests) y sin errores de tipos.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: esquemas de contenido y validación del quiz" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Lector de contenido (`lib/contenido.ts`)

**Files:**
- Create: `src/lib/contenido.ts`, `src/lib/contenido.test.ts`

**Interfaces:**
- Consumes: `esquemaLeccion`, `esquemaModulo`, `formatearErrores`, `CabeceraLeccion`, `DatosModulo` (Task 2)
- Produces:
  - `DIRECTORIO_CONTENIDO: string` (= `<cwd>/contenido`)
  - `type ResumenLeccion = CabeceraLeccion & { id: string; slug: string; grupo: string; moduloSlug: string }`
  - `type Leccion = ResumenLeccion & { cuerpo: string }` (`cuerpo` = MDX sin cabecera)
  - `type Modulo = DatosModulo & { slug: string; grupo: string; lecciones: ResumenLeccion[] }` (lecciones ordenadas por `orden`)
  - `class ErrorDeContenido extends Error` (mensaje `[contenido] <ruta>: <detalle>`)
  - `slugDesdeNombre(nombre: string): string`
  - `obtenerModulos(grupo: string, base?: string): Modulo[]` (ordenados por `orden`)
  - `obtenerModulo(grupo: string, moduloSlug: string, base?: string): Modulo | undefined`
  - `obtenerLeccion(grupo: string, moduloSlug: string, leccionSlug: string, base?: string): Leccion | undefined`

- [ ] **Step 1: Instalar gray-matter**

```bash
npm install gray-matter
```

- [ ] **Step 2: Escribir los tests que fallan**

`src/lib/contenido.test.ts`:
```ts
// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { obtenerLeccion, obtenerModulo, obtenerModulos, slugDesdeNombre } from "./contenido";

function crearContenido(archivos: Record<string, string>): string {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "sol-a-sol-"));
  for (const [ruta, texto] of Object.entries(archivos)) {
    const destino = path.join(base, ruta);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, texto);
  }
  return base;
}

const QUIZ = `<Quiz pregunta="¿?" opciones={["a", "b"]} correcta={0} explicacion="Porque sí." />`;

function leccion(orden: number, { titulo = `Lección ${orden}`, cuerpo = `Texto.\n\n${QUIZ}\n` } = {}) {
  return `---\ntitulo: "${titulo}"\nresumen: "Resumen"\nduracion: 5\norden: ${orden}\nfuentes:\n  - "SBS"\n---\n\n${cuerpo}`;
}

function modulo(orden: number, titulo = `Módulo ${orden}`) {
  return JSON.stringify({ titulo, descripcion: "Descripción", orden, icono: "🪙" });
}

describe("slugDesdeNombre", () => {
  it("quita el prefijo numérico y la extensión", () => {
    expect(slugDesdeNombre("03-ahorrar")).toBe("ahorrar");
    expect(slugDesdeNombre("01-el-chanchito.mdx")).toBe("el-chanchito");
  });
});

describe("obtenerModulos", () => {
  it("ordena módulos y lecciones por el campo orden, no por el nombre", () => {
    const base = crearContenido({
      "ninos/01-segundo/modulo.json": modulo(2, "Segundo"),
      "ninos/01-segundo/01-x.mdx": leccion(1),
      "ninos/02-primero/modulo.json": modulo(1, "Primero"),
      "ninos/02-primero/01-b.mdx": leccion(2, { titulo: "B" }),
      "ninos/02-primero/02-a.mdx": leccion(1, { titulo: "A" }),
    });
    const modulos = obtenerModulos("ninos", base);
    expect(modulos.map((m) => m.slug)).toEqual(["primero", "segundo"]);
    expect(modulos[0].lecciones.map((l) => l.titulo)).toEqual(["A", "B"]);
    expect(modulos[0].lecciones[0].id).toBe("ninos/primero/a");
    expect(modulos[0].lecciones[0]).not.toHaveProperty("cuerpo");
  });

  it("ignora archivos que no son .mdx", () => {
    const base = crearContenido({
      "ninos/01-m/modulo.json": modulo(1),
      "ninos/01-m/01-a.mdx": leccion(1),
      "ninos/01-m/notas.txt": "borrador",
    });
    expect(obtenerModulos("ninos", base)[0].lecciones).toHaveLength(1);
  });

  it("falla con el archivo y el campo si la cabecera es inválida", () => {
    const base = crearContenido({
      "ninos/01-m/modulo.json": modulo(1),
      "ninos/01-m/01-a.mdx": "---\nresumen: \"R\"\nduracion: 5\norden: 1\nfuentes:\n  - \"SBS\"\n---\n\n" + QUIZ,
    });
    expect(() => obtenerModulos("ninos", base)).toThrow(/01-a\.mdx.*titulo/);
  });

  it("falla si una lección no tiene exactamente un Quiz", () => {
    const sinQuiz = crearContenido({ "ninos/01-m/modulo.json": modulo(1), "ninos/01-m/01-a.mdx": leccion(1, { cuerpo: "Sin quiz." }) });
    expect(() => obtenerModulos("ninos", sinQuiz)).toThrow(/exactamente un <Quiz>.*tiene 0/);

    const dosQuiz = crearContenido({ "ninos/01-m/modulo.json": modulo(1), "ninos/01-m/01-a.mdx": leccion(1, { cuerpo: `${QUIZ}\n\n${QUIZ}` }) });
    expect(() => obtenerModulos("ninos", dosQuiz)).toThrow(/tiene 2/);
  });

  it("falla si falta modulo.json o no es JSON válido", () => {
    const sinModulo = crearContenido({ "ninos/01-m/01-a.mdx": leccion(1) });
    expect(() => obtenerModulos("ninos", sinModulo)).toThrow(/modulo\.json.*falta/);

    const roto = crearContenido({ "ninos/01-m/modulo.json": "{ no es json", "ninos/01-m/01-a.mdx": leccion(1) });
    expect(() => obtenerModulos("ninos", roto)).toThrow(/JSON válido/);
  });

  it("falla si dos lecciones repiten orden o slug", () => {
    const orden = crearContenido({ "ninos/01-m/modulo.json": modulo(1), "ninos/01-m/01-a.mdx": leccion(1), "ninos/01-m/02-b.mdx": leccion(1) });
    expect(() => obtenerModulos("ninos", orden)).toThrow(/'orden' 1 repetido/);

    const slug = crearContenido({ "ninos/01-m/modulo.json": modulo(1), "ninos/01-m/01-a.mdx": leccion(1), "ninos/01-m/02-a.mdx": leccion(2) });
    expect(() => obtenerModulos("ninos", slug)).toThrow(/slug "a" repetido/);
  });

  it("falla si el grupo no existe", () => {
    expect(() => obtenerModulos("jovenes", crearContenido({}))).toThrow(/no existe la carpeta del grupo/);
  });
});

describe("obtenerModulo / obtenerLeccion", () => {
  const base = crearContenido({
    "ninos/03-ahorrar/modulo.json": modulo(1, "Ahorrar"),
    "ninos/03-ahorrar/01-el-chanchito.mdx": leccion(1, { titulo: "El chanchito" }),
  });

  it("encuentra un módulo por slug", () => {
    expect(obtenerModulo("ninos", "ahorrar", base)?.titulo).toBe("Ahorrar");
    expect(obtenerModulo("ninos", "no-existe", base)).toBeUndefined();
  });

  it("devuelve la lección con su cuerpo sin cabecera", () => {
    const l = obtenerLeccion("ninos", "ahorrar", "el-chanchito", base);
    expect(l?.id).toBe("ninos/ahorrar/el-chanchito");
    expect(l?.cuerpo).toContain("<Quiz");
    expect(l?.cuerpo).not.toContain("titulo:");
    expect(obtenerLeccion("ninos", "ahorrar", "otra", base)).toBeUndefined();
  });
});
```

- [ ] **Step 3: Correr y verificar que fallan**

Run: `npx vitest run src/lib/contenido.test.ts`
Expected: FAIL. No se puede resolver `./contenido`.

- [ ] **Step 4: Implementar**

`src/lib/contenido.ts`:
```ts
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
```

- [ ] **Step 5: Correr y verificar que pasan**

Run: `npm test && npm run typecheck`
Expected: PASS (todos los tests) y sin errores de tipos.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: lector y validador de contenido MDX" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Progreso en localStorage (`lib/progreso.ts`)

**Files:**
- Create: `src/lib/progreso.ts`, `src/lib/progreso.test.ts`

**Interfaces:**
- Produces:
  - `CLAVE_PROGRESO = "sol-a-sol:progreso"`, `EVENTO_PROGRESO = "sol-a-sol:progreso-cambio"`
  - `type Progreso = { version: 1; completadas: string[] }`
  - `type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">`
  - `obtenerAlmacen(): Almacen | null`
  - `parsearProgreso(crudo: string | null): Progreso`
  - `leerProgreso(almacen?: Almacen | null): Progreso`
  - `marcarCompletada(id: string, almacen?: Almacen | null): Progreso`
  - `reiniciarProgreso(almacen?: Almacen | null): Progreso`
  - Si se omite `almacen`, se usa `obtenerAlmacen()`. Con `null` no se guarda nada. Nunca lanzan excepciones. Toda escritura dispara `EVENTO_PROGRESO` en `window`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/lib/progreso.test.ts`:
```ts
import { describe, expect, it, vi } from "vitest";
import {
  CLAVE_PROGRESO,
  EVENTO_PROGRESO,
  leerProgreso,
  marcarCompletada,
  parsearProgreso,
  reiniciarProgreso,
  type Almacen,
} from "./progreso";

function almacenFalso(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial));
  const almacen: Almacen = {
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => {
      datos.set(k, v);
    },
    removeItem: (k) => {
      datos.delete(k);
    },
  };
  return { almacen, datos };
}

const almacenRoto: Almacen = {
  getItem: () => {
    throw new Error("bloqueado");
  },
  setItem: () => {
    throw new Error("bloqueado");
  },
  removeItem: () => {
    throw new Error("bloqueado");
  },
};

const VACIO = { version: 1, completadas: [] };

describe("parsearProgreso", () => {
  it("devuelve progreso vacío ante datos ausentes, corruptos o de otra versión", () => {
    expect(parsearProgreso(null)).toEqual(VACIO);
    expect(parsearProgreso("")).toEqual(VACIO);
    expect(parsearProgreso("{no es json")).toEqual(VACIO);
    expect(parsearProgreso(JSON.stringify({ version: 2, completadas: ["a"] }))).toEqual(VACIO);
    expect(parsearProgreso(JSON.stringify({ version: 1, completadas: "a" }))).toEqual(VACIO);
    expect(parsearProgreso(JSON.stringify({ version: 1, completadas: [1] }))).toEqual(VACIO);
  });

  it("lee progreso válido y elimina duplicados", () => {
    expect(parsearProgreso(JSON.stringify({ version: 1, completadas: ["a", "a", "b"] }))).toEqual({
      version: 1,
      completadas: ["a", "b"],
    });
  });
});

describe("marcarCompletada / leerProgreso / reiniciarProgreso", () => {
  it("guarda una lección completada una sola vez", () => {
    const { almacen, datos } = almacenFalso();
    marcarCompletada("ninos/ahorrar/el-chanchito", almacen);
    marcarCompletada("ninos/ahorrar/el-chanchito", almacen);
    expect(leerProgreso(almacen).completadas).toEqual(["ninos/ahorrar/el-chanchito"]);
    expect(JSON.parse(datos.get(CLAVE_PROGRESO)!)).toEqual({ version: 1, completadas: ["ninos/ahorrar/el-chanchito"] });
  });

  it("reinicia el progreso", () => {
    const { almacen } = almacenFalso({ [CLAVE_PROGRESO]: JSON.stringify({ version: 1, completadas: ["a"] }) });
    expect(reiniciarProgreso(almacen)).toEqual(VACIO);
    expect(leerProgreso(almacen)).toEqual(VACIO);
  });

  it("funciona sin almacenamiento y con almacenamiento bloqueado sin lanzar errores", () => {
    expect(leerProgreso(null)).toEqual(VACIO);
    expect(marcarCompletada("a", null).completadas).toEqual(["a"]);
    expect(() => marcarCompletada("a", almacenRoto)).not.toThrow();
    expect(leerProgreso(almacenRoto)).toEqual(VACIO);
    expect(() => reiniciarProgreso(almacenRoto)).not.toThrow();
  });

  it("avisa a la página cuando el progreso cambia", () => {
    const escucha = vi.fn();
    window.addEventListener(EVENTO_PROGRESO, escucha);
    const { almacen } = almacenFalso();
    marcarCompletada("a", almacen);
    reiniciarProgreso(almacen);
    window.removeEventListener(EVENTO_PROGRESO, escucha);
    expect(escucha).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npx vitest run src/lib/progreso.test.ts`
Expected: FAIL. No se puede resolver `./progreso`.

- [ ] **Step 3: Implementar**

`src/lib/progreso.ts`:
```ts
export const CLAVE_PROGRESO = "sol-a-sol:progreso";
export const EVENTO_PROGRESO = "sol-a-sol:progreso-cambio";

export type Progreso = { version: 1; completadas: string[] };
export type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function vacio(): Progreso {
  return { version: 1, completadas: [] };
}

export function obtenerAlmacen(): Almacen | null {
  try {
    if (typeof window === "undefined") return null;
    const almacen = window.localStorage;
    const prueba = "__sol-a-sol-prueba__";
    almacen.setItem(prueba, prueba);
    almacen.removeItem(prueba);
    return almacen;
  } catch {
    return null;
  }
}

export function parsearProgreso(crudo: string | null): Progreso {
  if (!crudo) return vacio();
  try {
    const datos = JSON.parse(crudo);
    const valido =
      datos?.version === 1 &&
      Array.isArray(datos.completadas) &&
      datos.completadas.every((id: unknown) => typeof id === "string");
    return valido ? { version: 1, completadas: [...new Set<string>(datos.completadas)] } : vacio();
  } catch {
    return vacio();
  }
}

function notificar() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_PROGRESO));
}

export function leerProgreso(almacen: Almacen | null = obtenerAlmacen()): Progreso {
  if (!almacen) return vacio();
  try {
    return parsearProgreso(almacen.getItem(CLAVE_PROGRESO));
  } catch {
    return vacio();
  }
}

export function marcarCompletada(id: string, almacen: Almacen | null = obtenerAlmacen()): Progreso {
  const actual = leerProgreso(almacen);
  if (actual.completadas.includes(id)) return actual;
  const nuevo: Progreso = { version: 1, completadas: [...actual.completadas, id] };
  try {
    almacen?.setItem(CLAVE_PROGRESO, JSON.stringify(nuevo));
  } catch {
    // Sin almacenamiento disponible: el avance no se recuerda, pero la app sigue funcionando.
  }
  notificar();
  return nuevo;
}

export function reiniciarProgreso(almacen: Almacen | null = obtenerAlmacen()): Progreso {
  try {
    almacen?.removeItem(CLAVE_PROGRESO);
  } catch {
    // Igual que arriba: nada que borrar si el almacenamiento está bloqueado.
  }
  notificar();
  return vacio();
}
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: progreso de lecciones en localStorage" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Identidad visual, layout, Vicu y portada

**Files:**
- Create: `src/components/Vicu.tsx`, `src/components/Encabezado.tsx`, `src/components/Encabezado.test.tsx`, `src/app/page.test.tsx`
- Modify (reemplazar completo): `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Delete: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg` (los que existan)

**Interfaces:**
- Produces:
  - `Vicu({ className }: { className?: string })`: SVG decorativo (`aria-hidden`)
  - `Encabezado()`
  - Clases Tailwind de color: `bg-fondo`, `bg-superficie`, `text-texto`, `text-texto-suave`, `text-primario`, `bg-primario`, `text-primario-oscuro`, `border-primario`, `bg-acento`, `border-acento`, `text-exito`, `bg-exito`, `border-exito`, `bg-exito-suave`, `bg-aviso-suave`, `border-borde`, `bg-borde`
  - Clase CSS `.leccion` para el cuerpo MDX

- [ ] **Step 1: Escribir los tests que fallan**

`src/components/Encabezado.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Encabezado } from "./Encabezado";

it("enlaza al inicio y a la página Acerca", () => {
  render(<Encabezado />);
  expect(screen.getByRole("link", { name: "Sol a Sol" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Acerca" })).toHaveAttribute("href", "/acerca");
});
```

`src/app/page.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Portada from "./page";

it("ofrece el grupo Niños y marca los demás como próximamente", () => {
  render(<Portada />);
  expect(screen.getByRole("link", { name: /Niños/ })).toHaveAttribute("href", "/ninos");
  expect(screen.getAllByText("Próximamente")).toHaveLength(2);
  expect(screen.queryByRole("link", { name: /Jóvenes/ })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npm test`
Expected: FAIL. No existe `./Encabezado`, y la portada del scaffold no tiene el link "Niños".

- [ ] **Step 3: Implementar**

`src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-fondo: #fff8ee;
  --color-superficie: #ffffff;
  --color-texto: #2b1b10;
  --color-texto-suave: #5c4633;
  --color-primario: #b2381f;
  --color-primario-oscuro: #8c2a16;
  --color-acento: #e0a020;
  --color-exito: #2e7d4f;
  --color-exito-suave: #e3f2e8;
  --color-aviso-suave: #fdf0d5;
  --color-borde: #ead9c2;
}

@theme inline {
  --font-sans: var(--font-nunito), ui-rounded, system-ui, sans-serif;
}

:focus-visible {
  outline: 3px solid var(--color-primario);
  outline-offset: 2px;
}

.leccion > * + * {
  margin-top: 1.25rem;
}
.leccion p,
.leccion li {
  font-size: 1.125rem;
  line-height: 1.75;
}
.leccion ul {
  list-style: disc;
  padding-left: 1.5rem;
}
.leccion ol {
  list-style: decimal;
  padding-left: 1.5rem;
}
.leccion h2 {
  font-size: 1.5rem;
  font-weight: 800;
}
.leccion strong {
  font-weight: 800;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`src/components/Vicu.tsx`:
```tsx
export function Vicu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <path d="M20 14 L24 2 L28 14 Z" fill="#c8894b" />
      <path d="M36 14 L40 2 L44 14 Z" fill="#c8894b" />
      <path d="M22 34 Q20 52 24 62 L40 62 Q44 52 42 34 Z" fill="#d9a066" />
      <path d="M27 40 Q26 52 28 62 L36 62 Q38 52 37 40 Z" fill="#fbf3e6" />
      <ellipse cx="32" cy="24" rx="14" ry="13" fill="#d9a066" />
      <ellipse cx="32" cy="31" rx="8" ry="6" fill="#f4e1c6" />
      <circle cx="26" cy="22" r="2.2" fill="#2b1b10" />
      <circle cx="38" cy="22" r="2.2" fill="#2b1b10" />
      <ellipse cx="32" cy="29" rx="2" ry="1.3" fill="#2b1b10" />
      <path d="M28.5 33 Q32 36 35.5 33" stroke="#2b1b10" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
```

`src/components/Encabezado.tsx`:
```tsx
import Link from "next/link";
import { Vicu } from "@/components/Vicu";

export function Encabezado() {
  return (
    <header className="border-b border-borde bg-superficie">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-primario">
          <Vicu className="h-9 w-9" />
          Sol a Sol
        </Link>
        <nav aria-label="Principal">
          <Link href="/acerca" className="rounded-lg px-3 py-2 font-semibold text-texto-suave hover:bg-fondo">
            Acerca
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

`src/app/layout.tsx`:
```tsx
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
```

`src/app/page.tsx`:
```tsx
import Link from "next/link";
import { Vicu } from "@/components/Vicu";

const PROXIMAMENTE = [
  { nombre: "Jóvenes", icono: "🧑‍🎓" },
  { nombre: "Adultos", icono: "👩‍💼" },
];

export default function Portada() {
  return (
    <div className="text-center">
      <Vicu className="mx-auto h-28 w-28" />
      <h1 className="mt-4 text-4xl font-extrabold">Aprende a manejar tu plata, sol a sol</h1>
      <p className="mt-3 text-lg text-texto-suave">Clases cortas de educación financiera pensadas para el Perú. Elige tu grupo:</p>

      <ul className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        <li>
          <Link
            href="/ninos"
            className="flex h-full flex-col rounded-3xl border-2 border-primario bg-superficie p-5 hover:bg-aviso-suave"
          >
            <span aria-hidden="true" className="text-4xl">🧒</span>
            <span className="mt-2 text-2xl font-extrabold">Niños</span>
            <span className="text-texto-suave">8 a 12 años</span>
          </Link>
        </li>
        {PROXIMAMENTE.map((grupo) => (
          <li key={grupo.nombre}>
            <div className="flex h-full flex-col rounded-3xl border-2 border-dashed border-borde bg-superficie p-5 opacity-80">
              <span aria-hidden="true" className="text-4xl">{grupo.icono}</span>
              <span className="mt-2 text-2xl font-extrabold">{grupo.nombre}</span>
              <span className="text-texto-suave">Próximamente</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```bash
rm -f public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 5: Revisión visual rápida**

Run: `npm run dev` y abrir `http://localhost:3000` en ancho de celular (DevTools, 390px). Verificar que Vicu se vea bien, la fuente sea redondeada y la tarjeta Niños se destaque. Detener el servidor.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: identidad visual, layout, mascota Vicu y portada" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Componentes de lección (Personaje, Dato, ParaAdultos, Imagen)

**Files:**
- Create: `src/components/lecciones/Personaje.tsx`, `Dato.tsx`, `ParaAdultos.tsx`, `Imagen.tsx`, `src/components/lecciones/componentes.test.tsx`

**Interfaces:**
- Consumes: `Vicu` (Task 5)
- Produces:
  - `Personaje({ children })`: `<aside aria-label="Vicu dice">`
  - `Dato({ children })`
  - `ParaAdultos({ children })`: `<details>` cerrado por defecto, con resumen "Para papás y profes"
  - `Imagen({ src, alt, ancho?, alto? }: { src: string; alt: string; ancho?: number; alto?: number })`: lanza un error si `alt` está vacío

- [ ] **Step 1: Escribir los tests que fallan**

`src/components/lecciones/componentes.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dato } from "./Dato";
import { Imagen } from "./Imagen";
import { ParaAdultos } from "./ParaAdultos";
import { Personaje } from "./Personaje";

describe("Personaje", () => {
  it("muestra lo que dice Vicu", () => {
    render(<Personaje>¡Hola, soy Vicu!</Personaje>);
    expect(screen.getByRole("complementary", { name: "Vicu dice" })).toHaveTextContent("¡Hola, soy Vicu!");
  });
});

describe("Dato", () => {
  it("destaca la idea clave", () => {
    render(<Dato>Ahorrar es guardar.</Dato>);
    expect(screen.getByText("Idea clave")).toBeInTheDocument();
    expect(screen.getByText("Ahorrar es guardar.")).toBeInTheDocument();
  });
});

describe("ParaAdultos", () => {
  it("empieza cerrado y tiene el título para adultos", () => {
    const { container } = render(<ParaAdultos>Pregúntele algo.</ParaAdultos>);
    expect(container.querySelector("details")).not.toHaveAttribute("open");
    expect(screen.getByText("Para papás y profes")).toBeInTheDocument();
  });
});

describe("Imagen", () => {
  it("muestra la imagen con su texto alternativo", () => {
    render(<Imagen src="/ilustraciones/chanchito.svg" alt="Un chanchito de ahorro" />);
    expect(screen.getByRole("img", { name: "Un chanchito de ahorro" })).toBeInTheDocument();
  });

  it("falla si no tiene texto alternativo", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Imagen src="/x.svg" alt=" " />)).toThrow(/texto alternativo/);
  });
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npx vitest run src/components/lecciones`
Expected: FAIL. Los módulos no existen.

- [ ] **Step 3: Implementar**

`src/components/lecciones/Personaje.tsx`:
```tsx
import { Vicu } from "@/components/Vicu";

export function Personaje({ children }: { children: React.ReactNode }) {
  return (
    <aside aria-label="Vicu dice" className="flex items-start gap-3">
      <Vicu className="h-14 w-14 shrink-0" />
      <div className="rounded-2xl rounded-tl-none border-2 border-borde bg-superficie px-4 py-3 text-lg">{children}</div>
    </aside>
  );
}
```

`src/components/lecciones/Dato.tsx`:
```tsx
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
```

`src/components/lecciones/ParaAdultos.tsx`:
```tsx
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
```

`src/components/lecciones/Imagen.tsx`:
```tsx
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
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: componentes de lección Personaje, Dato, ParaAdultos e Imagen" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Componente Quiz

**Files:**
- Create: `src/components/lecciones/Quiz.tsx`, `src/components/lecciones/Quiz.test.tsx`

**Interfaces:**
- Consumes: `marcarCompletada`, `CLAVE_PROGRESO` (Task 4), `PropsQuiz` (Task 2)
- Produces: `Quiz(props: PropsQuiz & { leccionId: string })`, un componente cliente. Muestra la pregunta y un botón por opción. Si la respuesta es incorrecta, muestra "¡Casi!…" y deja reintentar. Si es correcta, muestra "¡Muy bien! 🎉 <explicacion>", llama a `marcarCompletada(leccionId)` y desactiva las opciones. El feedback está en una región `aria-live="polite"`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/components/lecciones/Quiz.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CLAVE_PROGRESO } from "@/lib/progreso";
import { Quiz } from "./Quiz";

const props = {
  pregunta: "¿Qué es ahorrar?",
  opciones: ["Gastarlo todo", "Guardar una parte", "Perderlo"],
  correcta: 1,
  explicacion: "Guardar una parte es ahorrar.",
  leccionId: "ninos/ahorrar/el-chanchito",
};

function completadas(): string[] {
  const crudo = localStorage.getItem(CLAVE_PROGRESO);
  return crudo ? JSON.parse(crudo).completadas : [];
}

describe("Quiz", () => {
  beforeEach(() => localStorage.clear());

  it("muestra la pregunta y una opción por botón", () => {
    render(<Quiz {...props} />);
    expect(screen.getByRole("heading", { name: "¿Qué es ahorrar?" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("con una respuesta incorrecta anima a reintentar y no completa la lección", async () => {
    render(<Quiz {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Gastarlo todo" }));
    expect(screen.getByText(/¡Casi!/)).toBeInTheDocument();
    expect(screen.queryByText(props.explicacion, { exact: false })).not.toBeInTheDocument();
    expect(completadas()).toEqual([]);
    expect(screen.getByRole("button", { name: "Guardar una parte" })).toBeEnabled();
  });

  it("con la respuesta correcta felicita, explica y completa la lección", async () => {
    render(<Quiz {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Perderlo" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar una parte" }));
    expect(screen.getByText(/¡Muy bien!/)).toHaveTextContent(props.explicacion);
    expect(completadas()).toEqual(["ninos/ahorrar/el-chanchito"]);
    for (const boton of screen.getAllByRole("button")) expect(boton).toBeDisabled();
  });
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npx vitest run src/components/lecciones/Quiz.test.tsx`
Expected: FAIL. No existe `./Quiz`.

- [ ] **Step 3: Implementar**

`src/components/lecciones/Quiz.tsx`:
```tsx
"use client";

import { useId, useState } from "react";
import { marcarCompletada } from "@/lib/progreso";
import type { PropsQuiz } from "@/lib/quiz";

type Props = PropsQuiz & { leccionId: string };

export function Quiz({ pregunta, opciones, correcta, explicacion, leccionId }: Props) {
  const [elegida, setElegida] = useState<number | null>(null);
  const idPregunta = useId();
  const acerto = elegida === correcta;

  function responder(indice: number) {
    setElegida(indice);
    if (indice === correcta) marcarCompletada(leccionId);
  }

  return (
    <section aria-labelledby={idPregunta} className="rounded-3xl border-2 border-primario/30 bg-superficie p-5">
      <p className="text-sm font-extrabold uppercase tracking-wide text-primario">¿Qué aprendiste?</p>
      <h2 id={idPregunta} className="mt-1 text-xl font-extrabold">
        {pregunta}
      </h2>
      <ul className="mt-4 grid gap-3">
        {opciones.map((opcion, indice) => {
          const esElegida = elegida === indice;
          const estilo = esElegida
            ? indice === correcta
              ? "border-exito bg-exito-suave"
              : "border-primario bg-aviso-suave"
            : "border-borde bg-fondo hover:border-primario";
          return (
            <li key={indice}>
              <button
                type="button"
                onClick={() => responder(indice)}
                disabled={acerto}
                aria-pressed={esElegida}
                className={`min-h-12 w-full rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition-colors disabled:cursor-default ${estilo}`}
              >
                {opcion}
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite" className="mt-4 min-h-8 text-lg">
        {elegida !== null &&
          (acerto ? (
            <p className="font-bold text-exito">¡Muy bien! 🎉 {explicacion}</p>
          ) : (
            <p className="font-bold text-primario-oscuro">¡Casi! Esa no es. Intenta con otra opción 💪</p>
          ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: quiz interactivo que marca la lección como completada" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Página de lección + primera lección real

**Files:**
- Create: `src/components/lecciones/RenderLeccion.tsx`, `src/app/ninos/[modulo]/[leccion]/page.tsx`, `contenido/ninos/03-ahorrar/modulo.json`, `contenido/ninos/03-ahorrar/01-el-chanchito.mdx`

**Interfaces:**
- Consumes: `obtenerModulos`, `obtenerModulo`, `obtenerLeccion`, `Leccion` (Task 3), `validarQuiz`, `PropsQuiz` (Task 2), `Quiz` (Task 7), `Personaje`, `Dato`, `ParaAdultos`, `Imagen` (Task 6)
- Produces: `RenderLeccion({ leccion }: { leccion: Leccion })`, un Server Component asíncrono. Ruta estática `/ninos/<modulo>/<leccion>` con `dynamicParams = false`. Un `<Quiz>` inválido lanza `[contenido] <id>: <Quiz> inválido: …` y rompe el build.

- [ ] **Step 1: Instalar MDX**

```bash
npm install @mdx-js/mdx
```

- [ ] **Step 2: Crear la primera lección**

`contenido/ninos/03-ahorrar/modulo.json`:
```json
{
  "titulo": "Ahorrar",
  "descripcion": "Guarda hoy para cumplir tus metas de mañana.",
  "orden": 3,
  "icono": "🐷"
}
```

`contenido/ninos/03-ahorrar/01-el-chanchito.mdx`:
```mdx
---
titulo: "El chanchito de Mateo"
resumen: "Ahorrar es guardar hoy para algo que quieres mañana."
duracion: 5
orden: 1
fuentes:
  - "SBS – Educación financiera (www.sbs.gob.pe)"
---

Mateo tiene 9 años y vive en Arequipa. En una tienda del centro vio unas zapatillas rojas que cuestan **S/ 60**. ¡Las quiere muchísimo!

Cada día, su mamá le da **S/ 2** para el recreo. Casi siempre los gasta todos en la tienda del colegio, y al final del día no le queda nada.

<Personaje>¿Y si guardas S/ 1 cada día? En unos dos meses (60 días) tendrías S/ 60.</Personaje>

Mateo busca una botella vacía, le hace una ranura con ayuda de su mamá y la convierte en su chanchito. Cada tarde mete **S/ 1**. Al principio le cuesta, pero cada semana la botella pesa más.

<Dato>Ahorrar es guardar una parte de tu dinero hoy para una meta de mañana.</Dato>

Ahorrar no significa no gastar nada: Mateo sigue usando S/ 1 en su recreo. Solo separa una parte para su meta.

<Quiz
  pregunta="Mateo recibe S/ 2 para el recreo. ¿Cuál de estas opciones es ahorrar?"
  opciones={["Gastar los S/ 2 en golosinas", "Guardar S/ 1 en su chanchito y usar S/ 1 en el recreo", "Prestar los S/ 2 y olvidarse"]}
  correcta={1}
  explicacion="Guardar una parte, aunque sea pequeña, es ahorrar. ¡Y todavía le queda para el recreo!"
/>

<ParaAdultos>

- Pregúntele: ¿para qué te gustaría ahorrar?
- Actividad: armen juntos un chanchito con una botella reciclada y peguen un dibujo de la meta.
- Ayúdele a contar lo ahorrado una vez por semana.

</ParaAdultos>
```

- [ ] **Step 3: Implementar el renderizador MDX**

`src/components/lecciones/RenderLeccion.tsx`:
```tsx
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { Leccion } from "@/lib/contenido";
import { validarQuiz, type PropsQuiz } from "@/lib/quiz";
import { Dato } from "./Dato";
import { Imagen } from "./Imagen";
import { ParaAdultos } from "./ParaAdultos";
import { Personaje } from "./Personaje";
import { Quiz } from "./Quiz";

export async function RenderLeccion({ leccion }: { leccion: Leccion }) {
  const { default: Contenido } = await evaluate(leccion.cuerpo, { ...runtime });

  function QuizDeLeccion(props: PropsQuiz) {
    const errores = validarQuiz(props);
    if (errores.length > 0) {
      throw new Error(`[contenido] ${leccion.id}: <Quiz> inválido: ${errores.join("; ")}`);
    }
    return <Quiz {...props} leccionId={leccion.id} />;
  }

  return <Contenido components={{ Quiz: QuizDeLeccion, Personaje, Dato, ParaAdultos, Imagen }} />;
}
```

- [ ] **Step 4: Implementar la página de lección**

`src/app/ninos/[modulo]/[leccion]/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RenderLeccion } from "@/components/lecciones/RenderLeccion";
import { obtenerLeccion, obtenerModulo, obtenerModulos } from "@/lib/contenido";

const GRUPO = "ninos";
export const dynamicParams = false;

type Params = Promise<{ modulo: string; leccion: string }>;

export function generateStaticParams() {
  return obtenerModulos(GRUPO).flatMap((m) => m.lecciones.map((l) => ({ modulo: m.slug, leccion: l.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { modulo, leccion } = await params;
  const datos = obtenerLeccion(GRUPO, modulo, leccion);
  return datos ? { title: datos.titulo, description: datos.resumen } : {};
}

export default async function PaginaLeccion({ params }: { params: Params }) {
  const { modulo: moduloSlug, leccion: leccionSlug } = await params;
  const modulo = obtenerModulo(GRUPO, moduloSlug);
  const leccion = obtenerLeccion(GRUPO, moduloSlug, leccionSlug);
  if (!modulo || !leccion) notFound();

  const indice = modulo.lecciones.findIndex((l) => l.slug === leccion.slug);
  const siguiente = modulo.lecciones[indice + 1];

  return (
    <article className="mx-auto max-w-2xl">
      <nav aria-label="Ruta" className="text-lg font-semibold">
        <Link href={`/${GRUPO}/${modulo.slug}`} className="text-primario hover:underline">
          ← {modulo.titulo}
        </Link>
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold">{leccion.titulo}</h1>
      <p className="mt-2 text-lg text-texto-suave">
        {leccion.resumen} · {leccion.duracion} min
      </p>

      <div className="leccion mt-8">
        <RenderLeccion leccion={leccion} />
      </div>

      <footer className="mt-10 border-t border-borde pt-6">
        {siguiente ? (
          <Link
            href={`/${GRUPO}/${modulo.slug}/${siguiente.slug}`}
            className="inline-flex min-h-12 items-center rounded-2xl bg-primario px-5 py-3 text-lg font-bold text-white hover:bg-primario-oscuro"
          >
            Siguiente: {siguiente.titulo} →
          </Link>
        ) : (
          <Link
            href={`/${GRUPO}/${modulo.slug}`}
            className="inline-flex min-h-12 items-center rounded-2xl bg-primario px-5 py-3 text-lg font-bold text-white hover:bg-primario-oscuro"
          >
            Volver al módulo
          </Link>
        )}
        <details className="mt-6 text-texto-suave">
          <summary className="cursor-pointer font-semibold">Fuentes</summary>
          <ul className="mt-2 list-disc pl-6">
            {leccion.fuentes.map((fuente) => (
              <li key={fuente}>{fuente}</li>
            ))}
          </ul>
        </details>
      </footer>
    </article>
  );
}
```

- [ ] **Step 5: Verificar build y render**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: el build lista `/ninos/[modulo]/[leccion]` con `/ninos/ahorrar/el-chanchito` como página estática (●/SSG).

Si `tsc` marca el spread `{ ...runtime }` como incompatible con las opciones de `evaluate`, usar `{ ...(runtime as Parameters<typeof evaluate>[1]) }`. Es el mismo objeto; solo cambia el tipo.

Después: `npm run dev`, abrir `http://localhost:3000/ninos/ahorrar/el-chanchito`, responder mal (sale "¡Casi!") y luego bien (sale "¡Muy bien!"), y comprobar que "Para papás y profes" se abre. Detener el servidor.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: página de lección con MDX y primera lección (El chanchito de Mateo)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Verificar que un quiz inválido rompe el build**

Cambiar temporalmente `correcta={1}` por `correcta={7}` en `contenido/ninos/03-ahorrar/01-el-chanchito.mdx`.
Run: `npm run build`
Expected: FAIL con `[contenido] ninos/ahorrar/el-chanchito: <Quiz> inválido: 'correcta' debe ser un índice entre 0 y 2`.
Revertir con `git checkout -- contenido/ninos/03-ahorrar/01-el-chanchito.mdx` y correr `npm run build` para confirmar que pasa otra vez.

---

### Task 9: Mapa de módulos, lista de lecciones, insignias y reinicio

**Files:**
- Create: `src/lib/useProgreso.ts`, `src/components/progreso/BarraProgreso.tsx`, `Insignia.tsx`, `ReiniciarProgreso.tsx`, `MapaModulos.tsx`, `ListaLecciones.tsx`, `datosDePrueba.ts`, `progreso.test.tsx`, `src/app/ninos/page.tsx`, `src/app/ninos/[modulo]/page.tsx`

**Interfaces:**
- Consumes: `Modulo` (Task 3), `CLAVE_PROGRESO`, `EVENTO_PROGRESO`, `parsearProgreso`, `reiniciarProgreso`, `Progreso` (Task 4), `Vicu`, `Personaje`
- Produces:
  - `useProgreso(): Progreso`: hook cliente sobre `useSyncExternalStore` que se actualiza con `EVENTO_PROGRESO` y con `storage`
  - `BarraProgreso({ hechas, total })`: texto `"<hechas> de <total> lecciones"`
  - `Insignia({ modulo })`: texto `"Insignia: <modulo>"`
  - `ReiniciarProgreso()`: botón "Empezar de nuevo" que pide confirmación dentro de la página ("Sí, borrar" / "No, volver"); se oculta si no hay progreso
  - `MapaModulos({ grupo, modulos })`, `ListaLecciones({ grupo, modulo })` (una lección completada lleva el texto sr-only "(completada)")

- [ ] **Step 1: Crear la fábrica de datos de prueba**

`src/components/progreso/datosDePrueba.ts`:
```ts
import type { Modulo } from "@/lib/contenido";

export function moduloDePrueba(cantidad = 2): Modulo {
  return {
    titulo: "Ahorrar",
    descripcion: "Guarda hoy para tus metas.",
    orden: 1,
    icono: "🐷",
    slug: "ahorrar",
    grupo: "ninos",
    lecciones: Array.from({ length: cantidad }, (_, i) => ({
      id: `ninos/ahorrar/l${i + 1}`,
      slug: `l${i + 1}`,
      grupo: "ninos",
      moduloSlug: "ahorrar",
      titulo: `Lección ${i + 1}`,
      resumen: "Resumen",
      duracion: 5,
      orden: i + 1,
      fuentes: ["SBS"],
    })),
  };
}
```

- [ ] **Step 2: Escribir los tests que fallan**

`src/components/progreso/progreso.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CLAVE_PROGRESO } from "@/lib/progreso";
import { moduloDePrueba } from "./datosDePrueba";
import { ListaLecciones } from "./ListaLecciones";
import { MapaModulos } from "./MapaModulos";

function guardarCompletadas(ids: string[]) {
  localStorage.setItem(CLAVE_PROGRESO, JSON.stringify({ version: 1, completadas: ids }));
}

beforeEach(() => localStorage.clear());

describe("MapaModulos", () => {
  it("sin progreso muestra 0 lecciones, sin insignia ni botón de reinicio", () => {
    render(<MapaModulos grupo="ninos" modulos={[moduloDePrueba()]} />);
    expect(screen.getByRole("link", { name: /^Ahorrar/ })).toHaveAttribute("href", "/ninos/ahorrar");
    expect(screen.getByText("0 de 2 lecciones")).toBeInTheDocument();
    expect(screen.queryByText(/Insignia/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Empezar de nuevo" })).not.toBeInTheDocument();
  });

  it("muestra el avance y la insignia al completar el módulo", () => {
    guardarCompletadas(["ninos/ahorrar/l1", "ninos/ahorrar/l2"]);
    render(<MapaModulos grupo="ninos" modulos={[moduloDePrueba()]} />);
    expect(screen.getByText("2 de 2 lecciones")).toBeInTheDocument();
    expect(screen.getByText("Insignia: Ahorrar")).toBeInTheDocument();
  });

  it("reinicia el progreso solo después de confirmar dentro de la página", async () => {
    guardarCompletadas(["ninos/ahorrar/l1"]);
    render(<MapaModulos grupo="ninos" modulos={[moduloDePrueba()]} />);
    expect(screen.getByText("1 de 2 lecciones")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Empezar de nuevo" }));
    await userEvent.click(screen.getByRole("button", { name: "No, volver" }));
    expect(screen.getByText("1 de 2 lecciones")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Empezar de nuevo" }));
    expect(screen.getByText(/Se borrará todo tu avance/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sí, borrar" }));
    expect(screen.getByText("0 de 2 lecciones")).toBeInTheDocument();
    expect(localStorage.getItem(CLAVE_PROGRESO)).toBeNull();
    expect(screen.queryByRole("button", { name: "Empezar de nuevo" })).not.toBeInTheDocument();
  });
});

describe("ListaLecciones", () => {
  it("enlaza cada lección y marca las completadas", () => {
    guardarCompletadas(["ninos/ahorrar/l1"]);
    render(<ListaLecciones grupo="ninos" modulo={moduloDePrueba()} />);
    expect(screen.getByRole("link", { name: /Lección 1.*\(completada\)/ })).toHaveAttribute("href", "/ninos/ahorrar/l1");
    expect(screen.getByRole("link", { name: /Lección 2/ })).not.toHaveTextContent("(completada)");
    expect(screen.getByText("1 de 2 lecciones")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Correr y verificar que fallan**

Run: `npx vitest run src/components/progreso`
Expected: FAIL. No existen `./ListaLecciones` ni `./MapaModulos`.

- [ ] **Step 4: Implementar el hook y los componentes**

`src/lib/useProgreso.ts`:
```ts
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CLAVE_PROGRESO, EVENTO_PROGRESO, parsearProgreso, type Progreso } from "./progreso";

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO_PROGRESO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO_PROGRESO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

function leerCrudo(): string {
  try {
    return window.localStorage.getItem(CLAVE_PROGRESO) ?? "";
  } catch {
    return "";
  }
}

export function useProgreso(): Progreso {
  const crudo = useSyncExternalStore(suscribir, leerCrudo, () => "");
  return useMemo(() => parsearProgreso(crudo), [crudo]);
}
```

`src/components/progreso/BarraProgreso.tsx`:
```tsx
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
```

`src/components/progreso/Insignia.tsx`:
```tsx
import { Vicu } from "@/components/Vicu";

export function Insignia({ modulo }: { modulo: string }) {
  return (
    <span className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-acento bg-aviso-suave px-3 py-1 text-sm font-extrabold">
      <Vicu className="h-6 w-6" />
      Insignia: {modulo}
    </span>
  );
}
```

`src/components/progreso/ReiniciarProgreso.tsx`:
```tsx
"use client";

import { useState } from "react";
import { reiniciarProgreso } from "@/lib/progreso";
import { useProgreso } from "@/lib/useProgreso";

const BOTON = "min-h-12 rounded-2xl border-2 px-4 py-2 font-bold";

export function ReiniciarProgreso() {
  const { completadas } = useProgreso();
  const [confirmando, setConfirmando] = useState(false);

  if (completadas.length === 0) return null;

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className={`${BOTON} border-borde bg-superficie text-texto-suave`}>
        Empezar de nuevo
      </button>
    );
  }

  return (
    <div role="group" aria-label="Confirmar reinicio" className="rounded-2xl border-2 border-primario bg-aviso-suave p-4">
      <p className="text-lg font-bold">¿Seguro? Se borrará todo tu avance y tus insignias.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            reiniciarProgreso();
            setConfirmando(false);
          }}
          className={`${BOTON} border-primario bg-primario text-white`}
        >
          Sí, borrar
        </button>
        <button type="button" onClick={() => setConfirmando(false)} className={`${BOTON} border-borde bg-superficie`}>
          No, volver
        </button>
      </div>
    </div>
  );
}
```

`src/components/progreso/MapaModulos.tsx`:
```tsx
"use client";

import Link from "next/link";
import type { Modulo } from "@/lib/contenido";
import { useProgreso } from "@/lib/useProgreso";
import { BarraProgreso } from "./BarraProgreso";
import { Insignia } from "./Insignia";
import { ReiniciarProgreso } from "./ReiniciarProgreso";

export function MapaModulos({ grupo, modulos }: { grupo: string; modulos: Modulo[] }) {
  const { completadas } = useProgreso();
  const hechas = new Set(completadas);

  return (
    <div>
      <ol className="grid gap-4">
        {modulos.map((modulo) => {
          const total = modulo.lecciones.length;
          const n = modulo.lecciones.filter((l) => hechas.has(l.id)).length;
          return (
            <li key={modulo.slug}>
              <Link
                href={`/${grupo}/${modulo.slug}`}
                className="block rounded-3xl border-2 border-borde bg-superficie p-5 hover:border-primario"
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-4xl">
                    {modulo.icono}
                  </span>
                  <span className="text-2xl font-extrabold">{modulo.titulo}</span>
                </span>
                <span className="mt-2 block text-lg text-texto-suave">{modulo.descripcion}</span>
                <BarraProgreso hechas={n} total={total} />
                {total > 0 && n === total && <Insignia modulo={modulo.titulo} />}
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-8">
        <ReiniciarProgreso />
      </div>
    </div>
  );
}
```

`src/components/progreso/ListaLecciones.tsx`:
```tsx
"use client";

import Link from "next/link";
import type { Modulo } from "@/lib/contenido";
import { useProgreso } from "@/lib/useProgreso";
import { BarraProgreso } from "./BarraProgreso";
import { Insignia } from "./Insignia";

export function ListaLecciones({ grupo, modulo }: { grupo: string; modulo: Modulo }) {
  const { completadas } = useProgreso();
  const hechas = new Set(completadas);
  const total = modulo.lecciones.length;
  const n = modulo.lecciones.filter((l) => hechas.has(l.id)).length;

  return (
    <div>
      <BarraProgreso hechas={n} total={total} />
      {total > 0 && n === total && <Insignia modulo={modulo.titulo} />}
      <ol className="mt-6 grid gap-3">
        {modulo.lecciones.map((leccion, i) => {
          const lista = hechas.has(leccion.id);
          return (
            <li key={leccion.slug}>
              <Link
                href={`/${grupo}/${modulo.slug}/${leccion.slug}`}
                className="flex items-center gap-4 rounded-2xl border-2 border-borde bg-superficie p-4 hover:border-primario"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-extrabold ${
                    lista ? "bg-exito text-white" : "bg-fondo text-texto-suave"
                  }`}
                >
                  {lista ? "✓" : i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold">{leccion.titulo}</span>
                  <span className="block text-texto-suave">
                    {leccion.resumen} · {leccion.duracion} min
                  </span>
                </span>
                {lista && <span className="sr-only">(completada)</span>}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasan**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Crear las páginas del grupo y del módulo**

`src/app/ninos/page.tsx`:
```tsx
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
```

`src/app/ninos/[modulo]/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaLecciones } from "@/components/progreso/ListaLecciones";
import { obtenerModulo, obtenerModulos } from "@/lib/contenido";

const GRUPO = "ninos";
export const dynamicParams = false;

type Params = Promise<{ modulo: string }>;

export function generateStaticParams() {
  return obtenerModulos(GRUPO).map((m) => ({ modulo: m.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { modulo } = await params;
  const datos = obtenerModulo(GRUPO, modulo);
  return datos ? { title: datos.titulo, description: datos.descripcion } : {};
}

export default async function PaginaModulo({ params }: { params: Params }) {
  const { modulo: moduloSlug } = await params;
  const modulo = obtenerModulo(GRUPO, moduloSlug);
  if (!modulo) notFound();

  return (
    <>
      <nav aria-label="Ruta" className="text-lg font-semibold">
        <Link href={`/${GRUPO}`} className="text-primario hover:underline">
          ← Todos los módulos
        </Link>
      </nav>
      <h1 className="mt-4 flex items-center gap-3 text-3xl font-extrabold">
        <span aria-hidden="true">{modulo.icono}</span>
        {modulo.titulo}
      </h1>
      <p className="mt-2 text-lg text-texto-suave">{modulo.descripcion}</p>
      <div className="mt-6">
        <ListaLecciones grupo={GRUPO} modulo={modulo} />
      </div>
    </>
  );
}
```

- [ ] **Step 7: Verificar todo**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todo en verde. El build lista `/ninos` y `/ninos/ahorrar` como estáticas.

Después, con `npm run dev`: completar el quiz del chanchito, volver a `/ninos/ahorrar` y ver ✓, "1 de 1 lecciones" e "Insignia: Ahorrar". En `/ninos`, probar "Empezar de nuevo" → "Sí, borrar". Detener el servidor.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: mapa de módulos, lista de lecciones, insignias y reinicio de progreso" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Página Acerca y página 404

**Files:**
- Create: `src/app/acerca/page.tsx`, `src/app/acerca/page.test.tsx`, `src/app/not-found.tsx`

**Interfaces:**
- Consumes: `Vicu`

- [ ] **Step 1: Escribir el test que falla**

`src/app/acerca/page.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Acerca from "./page";

it("explica el proyecto, aclara que no es asesoría y enlaza las fuentes oficiales", () => {
  render(<Acerca />);
  expect(screen.getByRole("heading", { level: 1, name: "Acerca de Sol a Sol" })).toBeInTheDocument();
  expect(screen.getByText(/no es asesoría financiera/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /SBS/ })).toHaveAttribute("href", "https://www.sbs.gob.pe");
  expect(screen.getByRole("link", { name: /BCRP/ })).toHaveAttribute("href", "https://www.bcrp.gob.pe");
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npx vitest run src/app/acerca`
Expected: FAIL. No existe `./page`.

- [ ] **Step 3: Implementar**

`src/app/acerca/page.tsx`:
```tsx
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
        Sol a Sol es un proyecto educativo: <strong>no es asesoría financiera</strong>. Para decisiones sobre tu
        dinero, consulta con una entidad supervisada por la SBS.
      </p>

      <h2>Tu privacidad</h2>
      <p>
        No pedimos cuentas ni datos personales. Tu avance se guarda solo en este navegador y puedes borrarlo
        cuando quieras con el botón “Empezar de nuevo”.
      </p>
    </div>
  );
}
```

`src/app/not-found.tsx`:
```tsx
import Link from "next/link";
import { Vicu } from "@/components/Vicu";

export default function NoEncontrado() {
  return (
    <div className="text-center">
      <Vicu className="mx-auto h-24 w-24" />
      <h1 className="mt-4 text-3xl font-extrabold">¡Uy! Esta página no existe</h1>
      <p className="mt-2 text-lg text-texto-suave">Vicu buscó por todas partes y no la encontró.</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-primario px-5 py-3 text-lg font-bold text-white hover:bg-primario-oscuro"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: página Acerca con fuentes y aviso, y página 404" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Prueba end-to-end con Playwright

**Files:**
- Create: `playwright.config.ts`, `e2e/recorrido.spec.ts`
- Modify: `package.json` (script `test:e2e`), `.gitignore`

**Interfaces:**
- Consumes: rutas `/`, `/ninos`, `/ninos/ahorrar`, `/ninos/ahorrar/el-chanchito` y los textos del quiz de la Task 8

- [ ] **Step 1: Instalar Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Agregar a `"scripts"` en `package.json`: `"test:e2e": "playwright test"`.
Agregar al final de `.gitignore`:
```
/test-results
/playwright-report
/playwright/.cache
```

- [ ] **Step 2: Configurar**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

const PUERTO = 3100;

export default defineConfig({
  testDir: "./e2e",
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PUERTO}`, trace: "on-first-retry" },
  projects: [{ name: "celular", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 3: Escribir la prueba**

`e2e/recorrido.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("la portada ofrece Niños y anuncia los demás grupos", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Niños/ })).toBeVisible();
  await expect(page.getByText("Próximamente")).toHaveCount(2);
});

test("un niño completa una lección y ve su avance al volver", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Niños/ }).click();
  await expect(page).toHaveURL(/\/ninos$/);

  await page.getByRole("link", { name: /^Ahorrar/ }).click();
  await page.getByRole("link", { name: /El chanchito de Mateo/ }).click();

  await page.getByRole("button", { name: "Gastar los S/ 2 en golosinas" }).click();
  await expect(page.getByText(/¡Casi!/)).toBeVisible();

  await page.getByRole("button", { name: "Guardar S/ 1 en su chanchito y usar S/ 1 en el recreo" }).click();
  await expect(page.getByText(/¡Muy bien!/)).toBeVisible();

  await page.getByRole("navigation", { name: "Ruta" }).getByRole("link").click();
  await expect(page.getByRole("link", { name: /El chanchito de Mateo.*\(completada\)/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: /El chanchito de Mateo.*\(completada\)/ })).toBeVisible();
});
```

- [ ] **Step 4: Correr**

Run: `npm run test:e2e`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: recorrido end-to-end de una lección en celular" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tasks 12–14: Contenido de los módulos 1, 2 y 3

**Proceso común a las tres tareas (seguirlo en cada una):**

1. **Verificar datos.** Por cada ítem de "Datos a verificar", buscar en la fuente oficial con WebSearch/WebFetch (priorizar `bcrp.gob.pe` y `sbs.gob.pe`) y anotar la URL. Si un dato **no se puede confirmar**, quitar la frase de la lección en vez de adivinar. Reemplazar las `fuentes` de la cabecera por el título real de la página consultada y su URL.
2. **Escribir los archivos** con los borradores de abajo, ajustados a lo verificado.
3. **Verificar:** `npm test && npm run build`.
4. **Revisión de Máximo (bloqueante):** levantar `npm run dev`, compartir las URLs de cada lección y la lista de datos verificados con sus fuentes, y **esperar la aprobación explícita**. Aplicar los cambios pedidos.
5. **Commit** solo después de la aprobación.

### Task 12: Módulo 1 — ¿Qué es el dinero?

**Files:**
- Create: `contenido/ninos/01-que-es-el-dinero/modulo.json`, `01-el-trueque.mdx`, `02-el-sol-peruano.mdx`, `03-cuida-tus-billetes.mdx`

**Datos a verificar:**
- Que en comunidades andinas del Perú todavía se hacen ferias de trueque (si no hay fuente confiable, quitar la frase de Vicu).
- Nombre oficial de la moneda ("sol"), símbolo `S/`, y que 1 sol = 100 céntimos.
- Monedas y billetes en circulación hoy (según el BCRP).
- Que el escudo nacional, que incluye la vicuña, aparece en las monedas.
- Recomendaciones del BCRP para reconocer billetes auténticos: el nombre de la campaña (p. ej. "Toca, mira y gira") y qué revisar en cada paso.

- [ ] **Step 1: Verificar los datos** (proceso común, paso 1)

- [ ] **Step 2: Escribir los archivos**

`modulo.json`:
```json
{
  "titulo": "¿Qué es el dinero?",
  "descripcion": "Del trueque a las monedas: descubre para qué sirve el dinero.",
  "orden": 1,
  "icono": "🪙"
}
```

`01-el-trueque.mdx`:
```mdx
---
titulo: "Antes del dinero: el trueque"
resumen: "Antes de que existiera el dinero, las personas cambiaban cosas por cosas."
duracion: 5
orden: 1
fuentes:
  - "BCRP – (título y URL verificados en el paso 1)"
---

Rosa vive en un pueblo de la sierra y su familia cultiva **papas**. Juan vive en la costa y su familia **pesca**.

Hace mucho tiempo, cuando no había dinero, Rosa y Juan podían hacer un **trueque**: cambiar papas por pescado. ¡Los dos ganaban!

Pero había problemas. ¿Y si Juan no quería papas? ¿Cuántas papas vale un pescado? ¿Y cómo llevas un costal de papas de un lado a otro?

<Personaje>¡En algunas comunidades de los Andes todavía se hacen ferias de trueque!</Personaje>

Para resolver esos problemas, las personas inventaron el **dinero**: algo que todos aceptan, que es fácil de contar y de llevar.

<Dato>El dinero sirve para intercambiar cosas de forma fácil, porque todos lo aceptan.</Dato>

<Quiz
  pregunta="¿Cuál era un problema del trueque?"
  opciones={["Que la otra persona no siempre quería lo que tú tenías", "Que las papas eran muy caras", "Que no existían los mercados"]}
  correcta={0}
  explicacion="Si Juan no quería papas, Rosa no podía conseguir pescado. El dinero resuelve eso porque todos lo aceptan."
/>

<ParaAdultos>

- Jueguen al trueque en casa: cada persona ofrece un objeto (un juguete, una fruta) y negocian cambios.
- Luego pregúntele: ¿qué fue lo más difícil? ¿Cómo lo haría más fácil el dinero?

</ParaAdultos>
```

`02-el-sol-peruano.mdx`:
```mdx
---
titulo: "Nuestra moneda: el sol"
resumen: "En el Perú usamos el sol, y cada sol tiene 100 céntimos."
duracion: 5
orden: 2
fuentes:
  - "BCRP – (título y URL verificados en el paso 1)"
---

Cada país tiene su propia moneda. En el Perú usamos el **sol**, y lo escribimos así: **S/**. Por ejemplo, S/ 5 son cinco soles.

Un sol se divide en **100 céntimos**. Por eso, dos monedas de 50 céntimos hacen S/ 1.

Hay **monedas** (de céntimos y de soles) y **billetes** (de montos más grandes):

- **Monedas:** 10, 20 y 50 céntimos; S/ 1, S/ 2 y S/ 5.
- **Billetes:** S/ 10, S/ 20, S/ 50, S/ 100 y S/ 200.

<Personaje>¡Búscame en tus monedas! Estoy en el escudo nacional, junto al árbol de la quina y la cornucopia.</Personaje>

<Dato>1 sol = 100 céntimos.</Dato>

<Quiz
  pregunta="¿Cuántos céntimos hay en S/ 1?"
  opciones={["10 céntimos", "50 céntimos", "100 céntimos"]}
  correcta={2}
  explicacion="Un sol tiene 100 céntimos. ¡Por eso dos monedas de 50 céntimos hacen un sol!"
/>

<ParaAdultos>

- Junten las monedas que haya en casa y ordénenlas de menor a mayor valor.
- Pregúntele: ¿qué monedas puedes juntar para formar S/ 1? ¿Y S/ 5?

</ParaAdultos>
```

> Nota: las listas de monedas y billetes son el borrador. Deben coincidir exactamente con lo que el BCRP indica hoy en circulación; si no coinciden, se corrigen.

`03-cuida-tus-billetes.mdx`:
```mdx
---
titulo: "Mira, toca y gira: cuida tus billetes"
resumen: "Aprende a revisar que un billete sea verdadero."
duracion: 5
orden: 3
fuentes:
  - "BCRP – (título y URL verificados en el paso 1)"
---

Sofía ayuda a su abuela en su puesto del mercado de Chiclayo. Un día, un señor paga con un billete y la abuela le dice: "Espera, Sofía, primero lo revisamos".

Los billetes verdaderos tienen **señales de seguridad** que se pueden revisar con las manos y los ojos:

- **Toca:** el billete tiene partes en relieve que se sienten ásperas con los dedos.
- **Mira:** a contraluz aparece una imagen escondida (la marca de agua) y un hilo de seguridad.
- **Gira:** al mover el billete, algunos números o figuras cambian de color.

<Personaje>Si un billete te parece raro, no lo recibas y avísale a un adulto.</Personaje>

<Dato>Antes de recibir un billete, revísalo: tócalo, míralo y gíralo.</Dato>

<Quiz
  pregunta="Si recibes un billete, ¿qué puedes hacer para saber si es verdadero?"
  opciones={["Tocarlo, mirarlo a contraluz y girarlo", "Mojarlo con agua", "Doblarlo muchas veces"]}
  correcta={0}
  explicacion="Tocar, mirar y girar el billete te ayuda a encontrar sus señales de seguridad."
/>

<ParaAdultos>

- Revisen juntos un billete real siguiendo las recomendaciones del BCRP.
- Explíquele qué hacer si recibe un billete sospechoso: no aceptarlo y avisar a un adulto.

</ParaAdultos>
```

> Nota: los tres pasos son el borrador. Se ajustan a las recomendaciones oficiales del BCRP. Si la campaña no se llama "Toca, mira y gira", se ajustan el título, el `Dato`, el quiz y la explicación a los pasos reales.

- [ ] **Step 3: Verificar** — `npm test && npm run build`. Expected: PASS, con 3 lecciones nuevas en `/ninos/que-es-el-dinero/*`.

- [ ] **Step 4: Revisión de Máximo** (proceso común, paso 4). **Esperar su aprobación.**

- [ ] **Step 5: Commit**

```bash
git add contenido/ninos/01-que-es-el-dinero
git commit -m "contenido: módulo 1 ¿Qué es el dinero? (3 lecciones)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 13: Módulo 2 — Necesidades y deseos

**Files:**
- Create: `contenido/ninos/02-necesidades-y-deseos/modulo.json`, `01-necesito-o-quiero.mdx`, `02-cuando-no-alcanza.mdx`

**Datos a verificar:**
- Una fuente de SBS o BCRP que trate "necesidades vs. deseos" en educación financiera para niños o escolares (para citar en `fuentes`). El módulo no afirma cifras oficiales; los precios son ejemplos.

- [ ] **Step 1: Verificar la fuente** (proceso común, paso 1)

- [ ] **Step 2: Escribir los archivos**

`modulo.json`:
```json
{
  "titulo": "Necesidades y deseos",
  "descripcion": "Aprende a diferenciar lo que necesitas de lo que quieres.",
  "orden": 2,
  "icono": "🎒"
}
```

`01-necesito-o-quiero.mdx`:
```mdx
---
titulo: "¿Lo necesito o lo quiero?"
resumen: "Las necesidades son lo que nos hace falta para vivir bien; los deseos, lo que nos gusta tener."
duracion: 5
orden: 1
fuentes:
  - "(fuente verificada en el paso 1)"
---

Lucía vive en Huancayo y acompaña a su papá al mercado. En la lista tienen: **arroz**, **verduras** y **un cuaderno** para el colegio.

En el camino, Lucía ve un peluche gigante y una gaseosa helada. "¡Papá, también quiero eso!"

<Personaje>¿Sabes la diferencia entre lo que necesitas y lo que quieres?</Personaje>

Una **necesidad** es algo sin lo que no podemos vivir bien: comida, agua, casa, ropa, salud y estudiar.

Un **deseo** es algo que nos gusta, pero podemos vivir sin él: un juguete nuevo, una golosina, un videojuego.

Los deseos no son malos. Pero primero se cubren las necesidades, y después, si alcanza, algún deseo.

<Dato>Primero las necesidades, después los deseos.</Dato>

<Quiz
  pregunta="¿Cuál de estas cosas es una necesidad?"
  opciones={["Un videojuego nuevo", "Agua para tomar", "Un juguete de moda"]}
  correcta={1}
  explicacion="Sin agua no podemos vivir. Los juguetes y videojuegos son deseos: nos gustan, pero podemos vivir sin ellos."
/>

<ParaAdultos>

- Al hacer las compras, pídale que clasifique la lista en "necesidad" o "deseo".
- Conversen: ¿algo puede ser necesidad para una persona y deseo para otra?

</ParaAdultos>
```

`02-cuando-no-alcanza.mdx`:
```mdx
---
titulo: "Cuando el dinero no alcanza para todo"
resumen: "El dinero es limitado: elegir una cosa a veces significa dejar otra."
duracion: 5
orden: 2
fuentes:
  - "(fuente verificada en el paso 1)"
---

Diego tiene **S/ 10**. Quiere comprar tres cosas en la librería de su barrio:

- Un cuaderno que le pidió su profesora: **S/ 4**
- Un chocolate: **S/ 3**
- Un llavero de su equipo favorito: **S/ 5**

Diego suma: 4 + 3 + 5 = **S/ 12**. ¡No le alcanza para todo!

<Personaje>Cuando el dinero no alcanza, hay que elegir. ¿Qué harías tú?</Personaje>

Diego primero compra el cuaderno, porque es una **necesidad**. Le quedan S/ 6. Ahora puede elegir: el chocolate (S/ 3) o el llavero (S/ 5)… pero no los dos.

<Dato>El dinero es limitado: cuando eliges una cosa, a veces dejas otra.</Dato>

<Quiz
  pregunta="Diego tiene S/ 10. ¿Qué debería comprar primero?"
  opciones={["El llavero de S/ 5", "El cuaderno de S/ 4 que le pidió su profesora", "El chocolate de S/ 3"]}
  correcta={1}
  explicacion="Primero la necesidad: el cuaderno. Con los S/ 6 que le quedan puede elegir el chocolate o el llavero, ¡pero no los dos!"
/>

<ParaAdultos>

- Dele un monto pequeño para una salida y deje que decida en qué gastarlo.
- Después conversen: ¿qué eligió?, ¿qué dejó?, ¿está contento con su decisión?

</ParaAdultos>
```

- [ ] **Step 3: Verificar** — `npm test && npm run build`. Expected: PASS.

- [ ] **Step 4: Revisión de Máximo** (proceso común, paso 4). **Esperar su aprobación.**

- [ ] **Step 5: Commit**

```bash
git add contenido/ninos/02-necesidades-y-deseos
git commit -m "contenido: módulo 2 Necesidades y deseos (2 lecciones)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 14: Módulo 3 — Ahorrar (completar)

**Files:**
- Create: `contenido/ninos/03-ahorrar/02-metas-de-ahorro.mdx`, `03-la-junta.mdx`
- Modify: `contenido/ninos/03-ahorrar/01-el-chanchito.mdx` (solo `fuentes`, con la fuente verificada)

**Datos a verificar:**
- Una fuente de SBS o BCRP sobre el ahorro para niños o escolares (para las 3 lecciones).
- Qué dice la SBS sobre juntas o panderos: que son informales y no están supervisados.
- Que los depósitos en entidades del sistema financiero están protegidos por el Fondo de Seguro de Depósitos, y su nombre exacto. **No citar montos de cobertura** en una lección para niños.

- [ ] **Step 1: Verificar los datos** (proceso común, paso 1)

- [ ] **Step 2: Escribir los archivos**

`02-metas-de-ahorro.mdx`:
```mdx
---
titulo: "Ponle una meta a tu ahorro"
resumen: "Una meta te dice qué quieres, cuánto cuesta y cuándo lo lograrás."
duracion: 5
orden: 2
fuentes:
  - "(fuente verificada en el paso 1)"
---

Camila vive en Iquitos y quiere un balón de fútbol que cuesta **S/ 30**. Su tía le dijo: "Si quieres ahorrar, ponle una meta".

Una meta de ahorro responde tres preguntas:

- **¿Qué quiero?** Un balón.
- **¿Cuánto cuesta?** S/ 30.
- **¿Cuánto guardaré y cada cuánto?** S/ 5 cada semana.

<Personaje>Si guardas S/ 5 cada semana, en 6 semanas juntas S/ 30. ¡Tu meta ya tiene fecha!</Personaje>

Camila dibuja el balón y lo pega en la pared. Cada semana pinta una parte del dibujo. Así ve cuánto le falta.

<Dato>Una meta clara (qué, cuánto y cuándo) te ayuda a no rendirte.</Dato>

<Quiz
  pregunta="Camila guarda S/ 5 cada semana. ¿En cuántas semanas junta S/ 30?"
  opciones={["3 semanas", "6 semanas", "10 semanas"]}
  correcta={1}
  explicacion="5 + 5 + 5 + 5 + 5 + 5 = 30. ¡En 6 semanas tiene su balón!"
/>

<ParaAdultos>

- Hagan juntos un cuadro de metas y péguenlo en un lugar visible (por ejemplo, la refrigeradora).
- Celebren cada avance, aunque sea pequeño.

</ParaAdultos>
```

`03-la-junta.mdx`:
```mdx
---
titulo: "La junta: ahorrar en grupo"
resumen: "En una junta, cada persona pone una parte y, por turnos, cada una recibe el total."
duracion: 5
orden: 3
fuentes:
  - "SBS – (título y URL verificados en el paso 1)"
---

La tía Carmen está en una **junta** con cuatro vecinas. Así funciona:

- Son **5 personas**.
- Cada mes, cada una pone **S/ 100**.
- Cada mes, una de ellas recibe todo: **S/ 500**.
- Después de 5 meses, todas recibieron S/ 500 una vez.

Este mes le tocó a la tía Carmen, y con los S/ 500 compró una cocina nueva.

<Personaje>La junta solo funciona si todas cumplen. Si alguien deja de pagar, las demás pierden su dinero.</Personaje>

Muchas familias en el Perú ahorran así. Pero hay que saber algo: la junta es **informal**. Ninguna institución la cuida, así que solo conviene hacerla con personas de mucha confianza.

<Dato>En una junta, todas ponen una parte y cada una recibe el total por turnos. Funciona solo si todas cumplen.</Dato>

<Quiz
  pregunta="¿Qué es lo más importante para que una junta funcione?"
  opciones={["Que todas las personas cumplan con poner su parte", "Que la junta sea muy grande", "Que el dinero se guarde debajo de la cama"]}
  correcta={0}
  explicacion="Si alguien deja de pagar, las demás pierden. Por eso la junta se hace solo con personas de confianza."
/>

<ParaAdultos>

- Si en su familia participan en juntas, cuéntele cómo funcionan y qué cuidados tienen.
- Puede comentar que el dinero guardado en entidades supervisadas por la SBS tiene una protección que las juntas no tienen (usar el nombre verificado del fondo).

</ParaAdultos>
```

En `01-el-chanchito.mdx`, reemplazar la línea de `fuentes` por la fuente verificada.

- [ ] **Step 3: Verificar** — `npm test && npm run build && npm run test:e2e`. Expected: PASS. La e2e sigue en verde porque el texto del quiz del chanchito no cambió.

- [ ] **Step 4: Revisión de Máximo** (proceso común, paso 4). **Esperar su aprobación.**

- [ ] **Step 5: Commit**

```bash
git add contenido/ninos/03-ahorrar
git commit -m "contenido: módulo 3 Ahorrar completo (metas y junta)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: README, GitHub y despliegue en Vercel

**Files:**
- Modify (reemplazar completo): `README.md`

- [ ] **Step 1: Escribir el README**

`README.md`:
````markdown
# Sol a Sol

App gratuita de educación financiera con ejemplos del Perú, separada por grupos de edad. Hoy incluye el grupo **Niños (8–12 años)**.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unitarias y de componentes (Vitest)
npm run test:e2e   # recorrido en navegador (Playwright)
npm run build      # también valida todo el contenido
```

## Cómo agregar una lección

1. Crea `contenido/<grupo>/<NN-modulo>/<NN-slug>.mdx`. El prefijo `NN-` solo sirve para ordenar la carpeta; la URL no lo usa.
2. Cabecera obligatoria:

   ```yaml
   ---
   titulo: "Título"
   resumen: "Una frase."
   duracion: 5
   orden: 1
   fuentes:
     - "Institución – título de la página (URL)"
   ---
   ```

3. Componentes disponibles: `<Personaje>`, `<Dato>`, `<Quiz pregunta="" opciones={[...]} correcta={0} explicacion="" />` (exactamente uno por lección), `<ParaAdultos>` e `<Imagen src="" alt="" />`.
4. `npm run build`: si algo está mal, el build falla y te dice el archivo y el campo.

Todo dato concreto debe venir de una fuente oficial (SBS, BCRP) citada en `fuentes`.

## Despliegue

Cada push a `main` se publica en Vercel. Cada pull request genera una URL de vista previa.
````

- [ ] **Step 2: Verificación final completa**

Run: `npm test && npm run typecheck && npm run lint && npm run build && npm run test:e2e`
Expected: todo en verde.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README con desarrollo y guía para agregar lecciones" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Crear el repo en GitHub (con confirmación de Máximo)**

Run: `gh auth status`. Si no hay sesión, pedir a Máximo que ejecute `! gh auth login`.
**Preguntar a Máximo si el repo será público o privado** antes de crearlo. Luego:
```bash
gh repo create sol-a-sol --public --source . --remote origin --push
```
(usar `--private` si así lo decide). Expected: el repo existe con la rama `main` subida.

- [ ] **Step 5: Conectar Vercel (lo hace Máximo, con guía)**

Indicar a Máximo:
1. Entrar a https://vercel.com/new con su cuenta de GitHub.
2. "Import" del repo `sol-a-sol`. Vercel detecta Next.js solo; no hace falta configurar nada.
3. Nombre del proyecto: `sol-a-sol`. Pulsar "Deploy".
4. Al terminar, compartir la URL (`sol-a-sol.vercel.app` o la que asigne Vercel).

- [ ] **Step 6: Verificar producción**

Con la URL de Máximo, abrir la portada, `/ninos`, una lección de cada módulo y `/acerca`. Completar un quiz y confirmar que el ✓ aparece en el módulo. Anotar la URL final en la memoria del proyecto.
