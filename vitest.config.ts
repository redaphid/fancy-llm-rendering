import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 300000,
    hookTimeout: 300000,
    // Exclude Playwright tests (run separately with npx playwright test)
    exclude: ["**/render.visual.spec.ts", "**/node_modules/**"],
    // Run tests sequentially to avoid Ollama state issues
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Don't run tests in parallel within a file
    sequence: {
      concurrent: false,
    },
  },
})
