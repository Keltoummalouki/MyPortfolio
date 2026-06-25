import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Unit-test runner. Pure logic only (validation schemas, content mapping) — no
// DOM and no Supabase. RLS integration tests (added in M2) run separately
// against the local Supabase stack.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  },
})
