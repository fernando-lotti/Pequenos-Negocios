import { describe, expect, it } from 'vitest'
import { calculateAccumulatedCash, calculateMonthlyProfit, calculateMonthlyWithdrawals } from './profit'
import type { CostEntry, CostKind } from '../costs/types'
import type { RevenueEntry } from '../revenue/types'
import type { Withdrawal } from '../withdrawals/types'

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
    revenueCategoryId: null,
    revenueDate: '2026-08-05',
    amountCents: 5000,
    unitsSold: null,
    paymentMethod: null,
    notes: null,
    createdAt: '2026-08-05T00:00:00.000Z',
    ...overrides,
  }
}

function makeWithdrawal(overrides: Partial<Withdrawal>): Withdrawal {
  return {
    id: 'withdrawal-1',
    businessId: 'business-1',
    withdrawalDate: '2026-08-05',
    amountCents: 200,
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

  it('conta lançamentos com categoria excluída como "sem categoria", sem sumir do total', () => {
    const costEntries = [
      makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 1000 }),
      makeCostEntry({ costCategoryId: null, amountCents: 300 }),
    ]
    const revenueEntries = [makeRevenueEntry({ amountCents: 5000 })]

    const result = calculateMonthlyProfit('2026-08', costEntries, revenueEntries, categoryKindById)

    expect(result.fixedCostCents).toBe(1000)
    expect(result.uncategorizedCostCents).toBe(300)
    expect(result.totalCostCents).toBe(1300)
    expect(result.profitCents).toBe(3700)
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

  it('calcula a margem média por unidade como (receita - custo variável) / unidades vendidas', () => {
    const costEntries = [
      makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 1000 }),
      makeCostEntry({ costCategoryId: 'category-variable', amountCents: 2000 }),
    ]
    const revenueEntries = [
      makeRevenueEntry({ amountCents: 3000, unitsSold: 10 }),
      makeRevenueEntry({ amountCents: 7000, unitsSold: 20 }),
    ]

    const result = calculateMonthlyProfit('2026-08', costEntries, revenueEntries, categoryKindById)

    expect(result.unitsSoldTotal).toBe(30)
    // (10000 receita - 2000 custo variável) / 30 unidades = 266,67 -> arredonda pra 267
    expect(result.marginPerUnitCents).toBe(267)
  })

  it('ignora receitas sem "unidades vendidas" preenchido ao somar as unidades', () => {
    const revenueEntries = [
      makeRevenueEntry({ amountCents: 3000, unitsSold: null }),
      makeRevenueEntry({ amountCents: 7000, unitsSold: 20 }),
    ]

    const result = calculateMonthlyProfit('2026-08', [], revenueEntries, categoryKindById)

    expect(result.unitsSoldTotal).toBe(20)
    expect(result.marginPerUnitCents).toBe(500)
  })

  it('devolve margem null quando nenhuma receita do mês tem unidades vendidas', () => {
    const revenueEntries = [makeRevenueEntry({ amountCents: 5000, unitsSold: null })]

    const result = calculateMonthlyProfit('2026-08', [], revenueEntries, categoryKindById)

    expect(result.unitsSoldTotal).toBe(0)
    expect(result.marginPerUnitCents).toBeNull()
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

    expect(calculateAccumulatedCash(costEntries, revenueEntries, [])).toBe(5500)
  })

  it('desconta também as retiradas de caixa, de qualquer mês', () => {
    const costEntries = [makeCostEntry({ costDate: '2026-08-01', amountCents: 500 })]
    const revenueEntries = [makeRevenueEntry({ revenueDate: '2026-08-15', amountCents: 4000 })]
    const withdrawals = [
      makeWithdrawal({ withdrawalDate: '2026-06-01', amountCents: 300 }),
      makeWithdrawal({ withdrawalDate: '2026-08-10', amountCents: 700 }),
    ]

    expect(calculateAccumulatedCash(costEntries, revenueEntries, withdrawals)).toBe(2500)
  })
})

describe('calculateMonthlyWithdrawals', () => {
  it('soma só as retiradas do mês pedido, ignorando outros meses', () => {
    const withdrawals = [
      makeWithdrawal({ withdrawalDate: '2026-08-05', amountCents: 200 }),
      makeWithdrawal({ withdrawalDate: '2026-08-20', amountCents: 300 }),
      makeWithdrawal({ withdrawalDate: '2026-07-20', amountCents: 9999 }),
    ]

    expect(calculateMonthlyWithdrawals('2026-08', withdrawals)).toBe(500)
  })

  it('devolve 0 quando não há retiradas no mês', () => {
    expect(calculateMonthlyWithdrawals('2026-08', [])).toBe(0)
  })
})
