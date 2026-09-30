// Alias de pruebas para "server-only": en Vitest (entorno de test) no hay
// separación cliente/servidor de Next.js, así que este módulo no hace nada.
// Se usa vía el alias de resolución en vitest.config.mts para que
// `import "server-only"` en src/lib/contenido.ts no rompa los tests.
export {};
