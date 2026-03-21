/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/gitforge-dashboard/",
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    reporters: ["default", "junit"],
    outputFile: {
      junit: "junit-report.xml",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Type-only files (interfaces, type aliases, no executable code)
        "src/**/*.d.ts",
        "src/domain/entities/platform.ts",
        "src/domain/entities/repository.ts",
        "src/domain/entities/contributor.ts",
        "src/domain/entities/release.ts",
        "src/domain/entities/tag.ts",
        "src/domain/entities/workflow_status.ts",
        "src/domain/entities/sonar_metrics.ts",
        "src/domain/repositories/**",
        "src/domain/services/**",
        "src/service/mappers/*_node.ts",
        // Entry point (single ReactDOM.createRoot call)
        "src/main/main.tsx",
        // Uses IndexedDB (unavailable in jsdom); 46 lines with in-memory fallback
        "src/infrastructure/crypto/crypto_key_store.ts",
        // Root orchestrator with async init + many wired dependencies; tested indirectly via page/component tests
        "src/main/app.tsx",
        // Trivial wrapper (12 lines) delegating entirely to AuthGate which is fully tested
        "src/presentation/pages/login_page.tsx",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 77,
        statements: 90,
      },
    },
  },
});
