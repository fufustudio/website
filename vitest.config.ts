import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@/site": path.resolve(__dirname, "src/app/(site)"),
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
