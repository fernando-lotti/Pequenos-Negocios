/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // e2e/ é o smoke test (Playwright) — roda separado, com "npx playwright
    // test" (ou "npm run test:e2e"), não faz parte de "npm test" (vitest).
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
