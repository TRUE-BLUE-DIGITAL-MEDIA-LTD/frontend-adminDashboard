import { defineConfig } from "vitest/config";

export default defineConfig({
  // Match Next's automatic JSX runtime so components need no `import React`.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
