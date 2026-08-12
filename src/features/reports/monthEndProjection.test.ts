import { describe, expect, it } from 'vitest'
import { calculateMonthEndProjection } from './monthEndProjection'

describe('calculateMonthEndProjection', () => {
  it('projeta receita e custo mantendo a média diária observada até hoje', () => {
    // R$1.000 de receita e R$400 de custo em 10 dias, mês de 30 dias
    // -> média diária x 30 dias = R$3.000 de receita, R$1.200 de custo
    const result = calculateMonthEndProjection(100_000, 40_000, 10, 30)
    expect(result.projectedRevenueCents).toBe(300_000)
    expect(result.projectedCostCents).toBe(120_000)
    expect(result.projectedProfitCents).toBe(180_000)
  })

  it('no último dia do mês, a projeção é igual ao valor real (sem gente pra extrapolar)', () => {
    const result = calculateMonthEndProjection(100_000, 40_000, 30, 30)
    expect(result.projectedRevenueCents).toBe(100_000)
    expect(result.projectedCostCents).toBe(40_000)
  })

  it('não divide por zero no primeiro dia do mês', () => {
    const result = calculateMonthEndProjection(10_000, 5_000, 0, 30)
    expect(result.projectedRevenueCents).toBe(300_000)
    expect(result.projectedCostCents).toBe(150_000)
  })

  it('funciona com receita e custo zerados', () => {
    const result = calculateMonthEndProjection(0, 0, 5, 30)
    expect(result).toEqual({ projectedRevenueCents: 0, projectedCostCents: 0, projectedProfitCents: 0 })
  })
})
