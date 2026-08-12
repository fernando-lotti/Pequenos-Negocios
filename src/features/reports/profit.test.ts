import { describe, expect, it } from 'vitest'
import { calculateAccumulatedCash, calculateMonthlyProfit } from './profit'
import type { CostEntry, CostKind } from '../costs/types'
import type { RevenueEntry } from '../revenue/types'

function makeCostEntry(overrides: Partial<CostEntry>): CostEntry {
  return {
    id: 'cost-1',
    businessId: 'business-1',
    costCategoryId: 'category-fixed',
    costDate: '2026-08-05',
    amountCents: 1000,
    quantity: null,
    notes: null,
    createdAt: '2026-08-05T00:00:00.000Z',
    ...overrides,
  }
}

function makeRevenueEntry(overrides: Partial<RevenueEntry>): RevenueEntry {
  return {
    id: 'revenue-1',
    businessId: 'business-1',
    revenueDate: '2026-08-05',
    amountCents: 5000,
    unitsSold: null,
    paymentMethod: null,
    notes: null,
    createdAt: '2026-08-05T00:00:00.000Z',
    ...overrides,
  }
}

const categoryKindById = new Map<string, CostKind>([
  ['category-fixed', 'fixed'],
  ['category-variable', 'variable'],
])

describe('calculateMonthlyProfit', () => {
  it('calcula lucro = receitas menos custos fixos e variáveis do mês', () => {
    const costEntries = [
      makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 1000 }),
      makeCostEntry({ costCategoryId: 'category-variable', amountCents: 500 }),
    ]
    const revenueEntries = [makeRevenueEntry({ amountCents: 5000 })]

    const result = calculateMonthlyProfit('2026-08', costEntries, revenueEntries, categoryKindById)

    expect(result.revenueCents).toBe(5000)
    expect(result.fixedCostCents).toBe(1000)
    expect(result.variableCostCents).toBe(500)
    expect(result.totalCostCents).toBe(1500)
    expect(result.profitCents).toBe(3500)
  })

  it('ignora lançamentos de outros meses', () => {
    const costEntries = [makeCostEntry({ costDate: '2026-07-20', amountCents: 9999 })]
    const revenueEntries = [makeRevenueEntry({ revenueDate: '2026-07-20', amountCents: 9999 })]

    const result = calculateMonthlyProfit('2026-08', costEntries, revenueEntries, categoryKindById)

    expect(result.revenueCents).toBe(0)
    expect(result.totalCostCents).toBe(0)
    expect(result.profitCents).toBe(0)
  })

  it('pode dar lucro negativo (prejuízo) quando os custos superam a receita', () => {
    const costEntries = [makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 10000 })]
    const revenueEntries = [makeRevenueEntry({ amountCents: 2000 })]

    const result = calculateMonthlyProfit('2026-08', costEntries, revenueEntries, categoryKindById)

    expect(result.profitCents).toBe(-8000)
  })

  it('recalcula automaticamente quando um lançamento passado muda (nunca há período travado)', () => {
    const costEntries = [makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 1000 })]
    const revenueEntries = [makeRevenueEntry({ amountCents: 5000 })]

    const before = calculateMonthlyProfit('2026-08', costEntries, revenueEntries, categoryKindById)
    expect(before.profitCents).toBe(4000)

    // Simula edição de um lançamento de um mês "passado" — a mesma função,
    // sem nenhum estado extra, já reflete o novo valor.
    const editedCostEntries = [makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 4000 })]
    const after = calculateMonthlyProfit('2026-08', editedCostEntries, revenueEntries, categoryKindById)
    expect(after.profitCents).toBe(1000)
  })
})

describe('calculateAccumulatedCash', () => {
  it('soma todas as receitas menos todos os custos, de qualquer mês', () => {
    const costEntries = [
      makeCostEntry({ costDate: '2026-06-01', amountCents: 1000 }),
      makeCostEntry({ costDate: '2026-08-01', amountCents: 500 }),
    ]
    const revenueEntries = [
      makeRevenueEntry({ revenueDate: '2026-06-15', amountCents: 3000 }),
      makeRevenueEntry({ revenueDate: '2026-08-15', amountCents: 4000 }),
    ]

    expect(calculateAccumulatedCash(costEntries, revenueEntries)).toBe(5500)
  })
})
