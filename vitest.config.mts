import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Vitest no distingue cliente/servidor como Next.js; contenido.ts
      // importa "server-only" (ver src/lib/contenido.ts), así que en tests
      // lo resolvemos a un módulo vacío.
      "server-only": path.resolve(import.meta.dirname, "./src/test/server-only-vacio.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
