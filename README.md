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
