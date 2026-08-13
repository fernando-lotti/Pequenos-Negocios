import { describe, expect, it } from 'vitest'
import { calculateInstallmentPlan } from './installments'

describe('calculateInstallmentPlan', () => {
  it('divide o valor total igualmente quando a divisão é exata', () => {
    const plan = calculateInstallmentPlan(100_000, 10, '2026-01-15')

    expect(plan).toHaveLength(10)
    expect(plan.every((item) => item.amountCents === 10_000)).toBe(true)
    expect(plan[0].date).toBe('2026-01-15')
    expect(plan[9].date).toBe('2026-10-15')
  })

  it('distribui a sobra de centavos nas primeiras parcelas, sem perder nem sobrar dinheiro', () => {
    // 100.000 centavos ÷ 3 = 33.333,33... -> base 33333, sobra 1 centavo
    const plan = calculateInstallmentPlan(100_000, 3, '2026-01-01')

    expect(plan.map((item) => item.amountCents)).toEqual([33_334, 33_333, 33_333])
    expect(plan.reduce((total, item) => total + item.amountCents, 0)).toBe(100_000)
  })

  it('cada parcela cai um mês depois da anterior, ajustando fim de mês quando preciso', () => {
    const plan = calculateInstallmentPlan(40_000, 4, '2026-01-31')

    expect(plan.map((item) => item.date)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30'])
  })

  it('uma única parcela devolve o valor total numa parcela só', () => {
    const plan = calculateInstallmentPlan(5_000, 1, '2026-03-10')
    expect(plan).toEqual([{ date: '2026-03-10', amountCents: 5_000 }])
  })

  it('devolve lista vazia pra número de parcelas inválido', () => {
    expect(calculateInstallmentPlan(10_000, 0, '2026-01-01')).toEqual([])
  })
})
