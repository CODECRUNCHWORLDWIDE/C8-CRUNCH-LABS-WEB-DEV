// playwright.config.ts
//
// Four projects:
//   - chromium / firefox / webkit  → the functional e2e suite, all browsers.
//   - visual                       → only *.visual.spec.ts, only Chromium,
//                                    against the Linux baseline.
//
// Two web servers:
//   - Keycloak via docker compose (slow to start; 2-minute timeout).
//   - The Vite dev server.
//
// Tracing is on-first-retry — captured when a test flakes, not always.

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  expect: {
    // Web-first assertions auto-retry up to this timeout.
    timeout: 5_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/*.visual.spec.ts',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/*.visual.spec.ts',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/*.visual.spec.ts',
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.visual.spec.ts',
    },
  ],
  webServer: [
    {
      command: 'docker compose up keycloak',
      url: 'http://localhost:8080/realms/crunch/.well-known/openid-configuration',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
