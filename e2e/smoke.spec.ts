import { test, expect } from '@playwright/test'

// Teste de fumaça: garante que o fluxo mais importante do produto continua
// funcionando de ponta a ponta — cadastro, ficha inicial, lançar um custo e
// uma receita, e ver o lucro do mês calculado corretamente. Precisa de um
// projeto Supabase real configurado em .env.local (ver playwright.config.ts).
test('cadastro, ficha inicial, lançamento de custo/receita e cálculo de lucro', async ({ page }) => {
  const uniqueEmail = `teste-${Date.now()}@example.com`
  const password = 'senha-teste-123'

  await page.goto('/')

  await page.getByRole('button', { name: 'Criar conta' }).click()
  await page.getByLabel('E-mail').fill(uniqueEmail)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Criar conta' }).click()

  // Ficha inicial: "Comerciante de produto" > "Pipoqueiro(a)"
  await expect(page.getByText('Qual é o seu negócio?')).toBeVisible({ timeout: 15_000 })
  await page.getByText('Comerciante de produto').click()
  await page.getByRole('button', { name: 'Pipoqueiro(a)' }).click()
  await page.getByLabel('Como você quer chamar esse negócio?').fill('Pipoca de teste')
  await page.getByRole('button', { name: 'Começar' }).click()

  await expect(page.getByText('Pipoca de teste')).toBeVisible({ timeout: 15_000 })

  // Lança um custo de R$ 50,00
  await page.getByRole('button', { name: 'Custos' }).click()
  await page.getByLabel('Valor').fill('5000')
  await page.getByRole('button', { name: 'Lançar custo' }).click()
  await expect(page.getByText('R$ 50,00')).toBeVisible()

  // Lança uma receita de R$ 120,00
  await page.getByRole('button', { name: 'Receitas' }).click()
  await page.getByLabel('Valor recebido').fill('12000')
  await page.getByRole('button', { name: 'Lançar receita' }).click()
  await expect(page.getByText('R$ 120,00')).toBeVisible()

  // Dashboard mostra o lucro do mês: R$ 120,00 - R$ 50,00 = R$ 70,00
  await page.getByRole('button', { name: 'Início' }).click()
  await expect(page.getByText('R$ 70,00').first()).toBeVisible()
})
