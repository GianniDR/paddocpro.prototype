import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for recording the pitch scene videos.
 * Run from `docs/pitch/hyperframes/`:
 *   npx playwright test --config record-scenes.config.ts
 *
 * Each test produces one MP4 in ./assets/ named per scene.
 */
export default defineConfig({
  testDir: "./scenes",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3030",
    locale: "en-GB",
    timezoneId: "Europe/London",
    video: {
      mode: "on",
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    launchOptions: {
      args: ["--window-size=1920,1080"],
    },
  },
  projects: [{ name: "record", use: { ...devices["Desktop Chrome"] } }],
  outputDir: "./scenes/output",
});
