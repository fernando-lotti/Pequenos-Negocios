import { defineConfig } from '@playwright/test'

// Configuração do "smoke test" (teste de fumaça) — roda contra o app local
// (sobe o "npm run dev" sozinho). Precisa de um projeto Supabase de teste
// configurado em .env.local, com a confirmação de e-mail desativada (ver
// supabase/README.md, passo 5) — sem isso o cadastro fica esperando
// confirmação por e-mail e o teste trava.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
})
