import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

/**
 * Mixed-environment Vitest config.
 *
 * - tests/unit/**       runs in Node (fast; no JSDOM overhead).
 * - tests/component/**  runs in JSDOM (so React renders).
 *
 * Both share the same setupFiles and coverage config.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom', // the default if no glob matches
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    environmentMatchGlobs: [
      ['tests/unit/**', 'node'],
      ['tests/component/**', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/main.jsx',
        'src/mocks/**',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
      ],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
})
