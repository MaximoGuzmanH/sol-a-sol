# Sol a Sol — Diseño del MVP (grupo Niños)

- **Fecha:** 2026-09-26
- **Estado:** Aprobado en brainstorming, pendiente de revisión del spec
- **Repo / URL objetivo:** `sol-a-sol` → `sol-a-sol.vercel.app`

## 1. Objetivo

Sol a Sol es una app web gratuita de educación financiera adaptada a la realidad peruana (cultura, moneda, instituciones y leyes). Separa los contenidos por grupos de edad: niños, jóvenes y adultos. Persigue tres objetivos a la vez:

1. **Producto real:** cualquiera que entre puede aprender con clases completas y correctas.
2. **Impacto social/educativo:** uso libre para familias, colegios y organizaciones, sin anuncios ni costo.
3. **Portafolio:** demuestra la construcción de una app moderna de punta a punta.

Consecuencia de diseño: **el contenido pesa tanto como el código.** Cada lección cita sus fuentes y pasa por revisión humana antes de publicarse.

## 2. Alcance del MVP

**Incluido:**

- Plataforma base preparada para varios grupos (rutas por grupo).
- Grupo **Niños (8–12 años)**, con los módulos 1, 2 y 3 y 2–3 lecciones cada uno (~8 lecciones):
  1. ¿Qué es el dinero? (trueque, el sol peruano, monedas y billetes)
  2. Necesidades vs. deseos
  3. Ahorrar (chanchito, metas, la "junta" explicada simple)
- Progreso local (sin cuentas) e insignias por módulo.
- Sección "Para papás y profes" en cada lección.
- Página `/acerca` con fuentes y aviso educativo.
- Despliegue en Vercel (plan gratuito).

**Fuera del MVP (a propósito):**

- Grupos Jóvenes y Adultos (aparecen como "Próximamente").
- Módulos de niños 4–7: Ganar dinero, Gastar con cabeza, Compartir y cuidar, El banco y el dinero digital.
- Cuentas de usuario, backend, base de datos.
- Idioma quechua (el contenido queda organizado de forma que se pueda agregar después).
- Simuladores, dominio propio y analytics.

**Supuestos:** solo castellano, diseño primero para celular, 100% gratuita y sin anuncios.

## 3. Arquitectura

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + MDX. Todas las páginas se generan estáticamente en el build: no hay servidor en runtime ni base de datos.

### Rutas

| Ruta | Contenido |
|---|---|
| `/` | Portada: elección de grupo. Niños activo; Jóvenes y Adultos como "Próximamente" |
| `/ninos` | Mapa de módulos con el progreso del niño |
| `/ninos/[modulo]` | Lista de lecciones del módulo |
| `/ninos/[modulo]/[leccion]` | Lección: historia + quiz + "Para papás y profes" |
| `/acerca` | Qué es el proyecto, fuentes y aviso "educativo, no asesoría financiera" |

Como el grupo forma parte de la URL, más adelante se agregan `/jovenes` y `/adultos` sin reestructurar nada.

### Estructura del repo

```
contenido/
  ninos/
    01-que-es-el-dinero/
      modulo.json            # titulo, descripcion, orden, icono
      01-el-trueque.mdx
      02-el-sol-peruano.mdx
    02-necesidades-y-deseos/
    03-ahorrar/
src/
  app/                       # rutas
  components/lecciones/      # Personaje, Dato, Quiz, ParaAdultos, Imagen
  lib/contenido.ts           # lee y valida módulos y lecciones
  lib/progreso.ts            # progreso en localStorage
```

**Separación de responsabilidades:** `contenido/` es solo texto, `components/` solo presentación y `lib/` solo lógica. Para escribir una lección basta con Markdown y las etiquetas de los componentes, sin saber React.

## 4. Formato de lección

Cada lección sigue el mismo ritmo y dura unos 5 minutos: **historia → idea clave → mini-quiz → para adultos**.

### Personaje guía

**Vicu**, una vicuña: aparece en el escudo nacional y en las monedas de sol. Se muestra con globos de diálogo. Es fácil de reemplazar si se decide otro personaje.

### Cabecera (frontmatter) de cada lección

| Campo | Tipo | Obligatorio |
|---|---|---|
| `titulo` | string | sí |
| `resumen` | string (una frase) | sí |
| `duracion` | número (minutos) | sí |
| `orden` | número entero ≥ 1, único dentro del módulo | sí |
| `fuentes` | lista de strings, mínimo 1 | sí |

### `modulo.json`

| Campo | Tipo | Obligatorio |
|---|---|---|
| `titulo` | string | sí |
| `descripcion` | string | sí |
| `orden` | número entero ≥ 1, único dentro del grupo | sí |
| `icono` | string (emoji o nombre de SVG) | sí |

### Ejemplo

```mdx
---
titulo: "El chanchito de Mateo"
resumen: "Ahorrar es guardar hoy para algo que quieres mañana."
duracion: 5
orden: 1
fuentes:
  - "SBS – Programa de educación financiera"
---

Mateo vive en Arequipa y quiere unas zapatillas de S/ 60...

<Personaje>¿Sabías que si guardas S/ 1 cada día, en dos meses tienes S/ 60?</Personaje>

<Dato>Ahorrar = guardar una parte de tu dinero para una meta.</Dato>

<Quiz pregunta="Mateo recibe S/ 5 de propina. ¿Qué es ahorrar?"
  opciones={["Gastarlo todo en golosinas", "Guardar S/ 2 en su chanchito", "Perderlo"]}
  correcta={1}
  explicacion="¡Bien! Guardar una parte, aunque sea pequeña, es ahorrar." />

<ParaAdultos>
- Pregúntele: ¿para qué te gustaría ahorrar?
- Actividad: armen juntos un chanchito con una botella reciclada.
</ParaAdultos>
```

### Componentes (set completo del MVP)

| Componente | Comportamiento |
|---|---|
| `<Personaje>` | Vicu con globo de diálogo |
| `<Dato>` | Tarjeta destacada con la idea clave |
| `<Quiz>` | Una pregunta con 2–4 opciones. Feedback amable al responder, permite reintentar y nunca castiga. Al responder bien, marca la lección como completada |
| `<ParaAdultos>` | Bloque plegable, cerrado por defecto, dirigido a padres/profesores con tono de "usted" |
| `<Imagen>` | Ilustración SVG; el texto alternativo (`alt`) es obligatorio |

Cada lección tiene exactamente un `<Quiz>`.

### Validación en build

`lib/contenido.ts` valida cabeceras, `modulo.json` y las props de `<Quiz>`: 2–4 opciones y `correcta` dentro de rango. Ante cualquier error, **`next build` falla** con un mensaje que indica el archivo y el campo. Una lección inválida nunca llega a producción.

## 5. Progreso

- Se guarda en `localStorage` bajo la clave `sol-a-sol:progreso` con el formato `{ "version": 1, "completadas": ["ninos/03-ahorrar/01-el-chanchito", ...] }`.
- Una lección se completa al responder bien su quiz.
- El mapa de módulos muestra ✓ por lección y una barra de avance por módulo.
- Al completar todas las lecciones de un módulo se gana una **insignia** (sticker de Vicu).
- El botón "Empezar de nuevo" borra el progreso, con confirmación dentro de la página (sin `confirm()` del navegador).
- **Sin `localStorage`** (incógnito o bloqueado): la app funciona normal pero no recuerda el avance. Todo acceso va en `try/catch`.
- **Datos corruptos o de versión desconocida:** se ignoran y se parte de progreso vacío, sin romper la página.

## 6. Diseño visual y accesibilidad

- **Primero para celular.** Botones grandes y fáciles de tocar.
- Paleta cálida inspirada en textiles andinos, sobre fondo claro con buen contraste. Tipografía redondeada y texto de lección de 18px o más.
- Ilustraciones SVG simples incluidas en el repo, sin imágenes pesadas, para que cargue rápido con datos móviles.
- **Accesibilidad:** contraste WCAG AA, navegación completa con teclado, `alt` obligatorio, feedback del quiz anunciado con `aria-live`, respeto de `prefers-reduced-motion` y animaciones mínimas.

## 7. Privacidad y aspectos legales

- Sin cuentas ni recolección de datos personales, así que no hay tratamiento de datos de menores bajo la Ley 29733.
- Sin cookies de terceros ni analytics en el MVP.
- `/acerca` aclara que el contenido es educativo y no constituye asesoría financiera, y lista las fuentes.

## 8. Flujo de contenido

1. Claude redacta el borrador de cada lección a partir de fuentes públicas (materiales de educación financiera de SBS y BCRP) y las cita en `fuentes`.
2. Todo dato concreto (por ejemplo, personajes de los billetes o medidas de seguridad) se verifica en la fuente oficial. No se inventa ningún dato.
3. **Máximo revisa y aprueba cada lección** antes de que se publique.

## 9. Pruebas

| Tipo | Herramienta | Qué cubre |
|---|---|---|
| Unitarias | Vitest | `lib/contenido.ts`: lectura, orden y rechazo de cabeceras/props inválidas. `lib/progreso.ts`: guardar, leer, reiniciar, sin `localStorage`, datos corruptos |
| Componentes | Testing Library | `<Quiz>`: respuesta correcta, incorrecta, reintento, marca de completado |
| End-to-end | Playwright | Portada → Niños → lección → quiz correcto → volver al mapa y ver ✓ |
| Contenido | `next build` | Validación de todas las lecciones |

## 10. Despliegue

- Repo `sol-a-sol` en el GitHub de Máximo, conectado a Vercel desde el panel de Vercel (lo hace Máximo con guía).
- Un push a `main` despliega producción; cada PR genera una URL de vista previa.
- Dominio `sol-a-sol.vercel.app`. Si está tomado, Vercel asigna uno con sufijo y el nombre del repo no cambia.

## 11. Criterios de éxito del MVP

- Las ~8 lecciones de los módulos 1–3 están publicadas, revisadas por Máximo y con fuentes.
- Un niño puede completar una lección en el celular sin ayuda y ver su progreso al volver.
- El build falla ante contenido inválido.
- Todas las pruebas pasan y el sitio está en producción en Vercel.
