import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./src",
  testMatch: "**/*.visual.test.ts",
  timeout: 300000,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: "on",
  },
  outputDir: "./outputs/test-results",
  reporter: [
    ["html", { outputFolder: "./outputs/playwright-report" }],
    ["list"],
  ],
})
