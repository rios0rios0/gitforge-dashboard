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
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main/main.tsx",
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
        "src/infrastructure/crypto/crypto_key_store.ts",
        "src/main/app.tsx",
        "src/presentation/pages/login_page.tsx",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
