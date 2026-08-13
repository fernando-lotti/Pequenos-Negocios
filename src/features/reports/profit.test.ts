import { describe, expect, it } from 'vitest'
import { calculateAccumulatedCash, calculateProfitForPeriod, calculateWithdrawalsForPeriod, getEarliestEntryDate } from './profit'
import type { CostCategory, CostEntry } from '../costs/types'
import type { RevenueCategory, RevenueEntry } from '../revenue/types'
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
    paymentMethodId: null,
    revenueDate: '2026-08-05',
    amountCents: 5000,
    unitsSold: null,
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

function makeCostCategory(overrides: Partial<CostCategory>): CostCategory {
  return {
    id: 'category-fixed',
    businessId: 'business-1',
    name: 'Aluguel',
    kind: 'fixed',
    unitLabel: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeRevenueCategory(overrides: Partial<RevenueCategory>): RevenueCategory {
  return {
    id: 'category-a',
    businessId: 'business-1',
    name: 'Pipoca doce',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const costCategories = [
  makeCostCategory({ id: 'category-fixed', name: 'Aluguel', kind: 'fixed' }),
  makeCostCategory({ id: 'category-variable', name: 'Embalagens', kind: 'variable' }),
]

const feePercentByPaymentMethodId = new Map<string, number>([
  ['pix', 0],
  ['credito', 8],
])

describe('calculateProfitForPeriod', () => {
  it('calcula lucro = receitas menos custos fixos e variáveis do período', () => {
    const costEntries = [
      makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 1000 }),
      makeCostEntry({ costCategoryId: 'category-variable', amountCents: 500 }),
    ]
    const revenueEntries = [makeRevenueEntry({ amountCents: 5000 })]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', costEntries, revenueEntries, costCategories, [])

    expect(result.revenueCents).toBe(5000)
    expect(result.fixedCostCents).toBe(1000)
    expect(result.variableCostCents).toBe(500)
    expect(result.totalCostCents).toBe(1500)
    expect(result.profitCents).toBe(3500)
  })

  it('ignora lançamentos fora do período', () => {
    const costEntries = [makeCostEntry({ costDate: '2026-07-20', amountCents: 9999 })]
    const revenueEntries = [makeRevenueEntry({ revenueDate: '2026-07-20', amountCents: 9999 })]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', costEntries, revenueEntries, costCategories, [])

    expect(result.revenueCents).toBe(0)
    expect(result.totalCostCents).toBe(0)
    expect(result.profitCents).toBe(0)
  })

  it('aceita um período que cruza vários meses', () => {
    const costEntries = [
      makeCostEntry({ costDate: '2026-07-15', costCategoryId: 'category-fixed', amountCents: 1000 }),
      makeCostEntry({ costDate: '2026-08-20', costCategoryId: 'category-variable', amountCents: 500 }),
      makeCostEntry({ costDate: '2026-09-01', costCategoryId: 'category-fixed', amountCents: 9999 }),
    ]
    const revenueEntries = [
      makeRevenueEntry({ revenueDate: '2026-07-10', amountCents: 3000 }),
      makeRevenueEntry({ revenueDate: '2026-08-25', amountCents: 4000 }),
    ]

    const result = calculateProfitForPeriod('2026-07-01', '2026-08-31', costEntries, revenueEntries, costCategories, [])

    expect(result.revenueCents).toBe(7000)
    expect(result.totalCostCents).toBe(1500)
    expect(result.profitCents).toBe(5500)
  })

  it('inclui lançamentos exatamente na data de início e na de fim do período', () => {
    const costEntries = [makeCostEntry({ costDate: '2026-08-01', amountCents: 100 })]
    const revenueEntries = [makeRevenueEntry({ revenueDate: '2026-08-31', amountCents: 200 })]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', costEntries, revenueEntries, costCategories, [])

    expect(result.totalCostCents).toBe(100)
    expect(result.revenueCents).toBe(200)
  })

  it('conta lançamentos com categoria excluída como "sem categoria", sem sumir do total', () => {
    const costEntries = [
      makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 1000 }),
      makeCostEntry({ costCategoryId: null, amountCents: 300 }),
    ]
    const revenueEntries = [makeRevenueEntry({ amountCents: 5000 })]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', costEntries, revenueEntries, costCategories, [])

    expect(result.fixedCostCents).toBe(1000)
    expect(result.uncategorizedCostCents).toBe(300)
    expect(result.totalCostCents).toBe(1300)
    expect(result.profitCents).toBe(3700)
  })

  it('pode dar lucro negativo (prejuízo) quando os custos superam a receita', () => {
    const costEntries = [makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 10000 })]
    const revenueEntries = [makeRevenueEntry({ amountCents: 2000 })]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', costEntries, revenueEntries, costCategories, [])

    expect(result.profitCents).toBe(-8000)
  })

  it('recalcula automaticamente quando um lançamento passado muda (nunca há período travado)', () => {
    const costEntries = [makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 1000 })]
    const revenueEntries = [makeRevenueEntry({ amountCents: 5000 })]

    const before = calculateProfitForPeriod('2026-08-01', '2026-08-31', costEntries, revenueEntries, costCategories, [])
    expect(before.profitCents).toBe(4000)

    // Simula edição de um lançamento de um período "passado" — a mesma
    // função, sem nenhum estado extra, já reflete o novo valor.
    const editedCostEntries = [makeCostEntry({ costCategoryId: 'category-fixed', amountCents: 4000 })]
    const after = calculateProfitForPeriod(
      '2026-08-01',
      '2026-08-31',
      editedCostEntries,
      revenueEntries,
      costCategories,
      [],
    )
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

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', costEntries, revenueEntries, costCategories, [])

    expect(result.unitsSoldTotal).toBe(30)
    // (10000 receita - 2000 custo variável) / 30 unidades = 266,67 -> arredonda pra 267
    expect(result.marginPerUnitCents).toBe(267)
  })

  it('ignora receitas sem "unidades vendidas" preenchido ao somar as unidades', () => {
    const revenueEntries = [
      makeRevenueEntry({ amountCents: 3000, unitsSold: null }),
      makeRevenueEntry({ amountCents: 7000, unitsSold: 20 }),
    ]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', [], revenueEntries, costCategories, [])

    expect(result.unitsSoldTotal).toBe(20)
    expect(result.marginPerUnitCents).toBe(500)
  })

  it('devolve margem null quando nenhuma receita do período tem unidades vendidas', () => {
    const revenueEntries = [makeRevenueEntry({ amountCents: 5000, unitsSold: null })]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', [], revenueEntries, costCategories, [])

    expect(result.unitsSoldTotal).toBe(0)
    expect(result.marginPerUnitCents).toBeNull()
  })

  it('desconta a taxa da forma de pagamento do lucro, de acordo com a receita', () => {
    const revenueEntries = [
      makeRevenueEntry({ amountCents: 10000, paymentMethodId: 'credito' }),
      makeRevenueEntry({ amountCents: 5000, paymentMethodId: 'pix' }),
    ]

    const result = calculateProfitForPeriod(
      '2026-08-01',
      '2026-08-31',
      [],
      revenueEntries,
      costCategories,
      [],
      feePercentByPaymentMethodId,
    )

    // 10000 * 8% = 800 de taxa no crédito; Pix não tem taxa (0%)
    expect(result.cardFeeCents).toBe(800)
    expect(result.profitCents).toBe(15000 - 800)
  })

  it('não desconta taxa de receita sem forma de pagamento escolhida', () => {
    const revenueEntries = [makeRevenueEntry({ amountCents: 10000, paymentMethodId: null })]

    const result = calculateProfitForPeriod(
      '2026-08-01',
      '2026-08-31',
      [],
      revenueEntries,
      costCategories,
      [],
      feePercentByPaymentMethodId,
    )

    expect(result.cardFeeCents).toBe(0)
  })

  it('não quebra quando feePercentByPaymentMethodId não é informado (parâmetro opcional)', () => {
    const revenueEntries = [makeRevenueEntry({ amountCents: 10000, paymentMethodId: 'credito' })]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', [], revenueEntries, costCategories, [])

    expect(result.cardFeeCents).toBe(0)
  })

  it('calcula o preço médio de venda por lançamento e por unidade', () => {
    const revenueEntries = [
      makeRevenueEntry({ amountCents: 1000, unitsSold: 5 }),
      makeRevenueEntry({ amountCents: 2000, unitsSold: 5 }),
    ]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', [], revenueEntries, costCategories, [])

    // 3000 receita / 2 lançamentos = 1500
    expect(result.avgSalePriceByCountCents).toBe(1500)
    // 3000 receita / 10 unidades = 300
    expect(result.avgSalePriceByUnitCents).toBe(300)
  })

  it('devolve preço médio null quando não há receita nem unidades vendidas no período', () => {
    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', [], [], costCategories, [])

    expect(result.avgSalePriceByCountCents).toBeNull()
    expect(result.avgSalePriceByUnitCents).toBeNull()
  })

  it('quebra os custos por categoria individual, na ordem em que as categorias foram passadas, escondendo categoria sem gasto no período', () => {
    const categories = [
      makeCostCategory({ id: 'cat-1', name: 'Aluguel', kind: 'fixed' }),
      makeCostCategory({ id: 'cat-2', name: 'Sem gasto no período', kind: 'variable' }),
      makeCostCategory({ id: 'cat-3', name: 'Embalagens', kind: 'variable' }),
    ]
    const costEntries = [
      makeCostEntry({ costCategoryId: 'cat-1', amountCents: 1000 }),
      makeCostEntry({ costCategoryId: 'cat-3', amountCents: 400 }),
      makeCostEntry({ costCategoryId: 'cat-3', amountCents: 100 }),
      makeCostEntry({ costCategoryId: null, amountCents: 50 }),
    ]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', costEntries, [], categories, [])

    expect(result.costByCategory).toEqual([
      { categoryId: 'cat-1', name: 'Aluguel', totalCents: 1000 },
      { categoryId: 'cat-3', name: 'Embalagens', totalCents: 500 },
      { categoryId: null, name: 'Sem categoria', totalCents: 50 },
    ])
  })

  it('quebra a receita por categoria, com preço médio próprio de cada uma', () => {
    const categories = [
      makeRevenueCategory({ id: 'cat-doce', name: 'Pipoca doce' }),
      makeRevenueCategory({ id: 'cat-salgada', name: 'Pipoca salgada' }),
      makeRevenueCategory({ id: 'cat-sem-venda', name: 'Sem venda no período' }),
    ]
    const revenueEntries = [
      makeRevenueEntry({ revenueCategoryId: 'cat-doce', amountCents: 1000, unitsSold: 2 }),
      makeRevenueEntry({ revenueCategoryId: 'cat-doce', amountCents: 500, unitsSold: 1 }),
      makeRevenueEntry({ revenueCategoryId: 'cat-salgada', amountCents: 900, unitsSold: null }),
      makeRevenueEntry({ revenueCategoryId: null, amountCents: 200, unitsSold: null }),
    ]

    const result = calculateProfitForPeriod('2026-08-01', '2026-08-31', [], revenueEntries, [], categories)

    expect(result.revenueByCategory).toEqual([
      {
        categoryId: 'cat-doce',
        name: 'Pipoca doce',
        totalCents: 1500,
        entryCount: 2,
        unitsSold: 3,
        avgPriceByCountCents: 750,
        avgPriceByUnitCents: 500,
      },
      {
        categoryId: 'cat-salgada',
        name: 'Pipoca salgada',
        totalCents: 900,
        entryCount: 1,
        unitsSold: 0,
        avgPriceByCountCents: 900,
        avgPriceByUnitCents: null,
      },
      {
        categoryId: null,
        name: 'Sem categoria',
        totalCents: 200,
        entryCount: 1,
        unitsSold: 0,
        avgPriceByCountCents: 200,
        avgPriceByUnitCents: null,
      },
    ])
  })
})

describe('getEarliestEntryDate', () => {
  it('devolve a data mais antiga entre custos e receitas', () => {
    const costEntries = [makeCostEntry({ costDate: '2026-06-10' })]
    const revenueEntries = [makeRevenueEntry({ revenueDate: '2026-05-01' }), makeRevenueEntry({ revenueDate: '2026-07-01' })]

    expect(getEarliestEntryDate(costEntries, revenueEntries)).toBe('2026-05-01')
  })

  it('devolve null quando não há nenhum lançamento', () => {
    expect(getEarliestEntryDate([], [])).toBeNull()
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

  it('desconta também as taxas de forma de pagamento do caixa, de qualquer mês', () => {
    const revenueEntries = [makeRevenueEntry({ revenueDate: '2026-08-15', amountCents: 10000, paymentMethodId: 'credito' })]

    // 10000 - 8% de taxa = 9200 de caixa de verdade, não 10000
    expect(calculateAccumulatedCash([], revenueEntries, [], feePercentByPaymentMethodId)).toBe(9200)
  })
})

describe('calculateWithdrawalsForPeriod', () => {
  it('soma só as retiradas dentro do período pedido, ignorando as de fora', () => {
    const withdrawals = [
      makeWithdrawal({ withdrawalDate: '2026-08-05', amountCents: 200 }),
      makeWithdrawal({ withdrawalDate: '2026-08-20', amountCents: 300 }),
      makeWithdrawal({ withdrawalDate: '2026-07-20', amountCents: 9999 }),
    ]

    expect(calculateWithdrawalsForPeriod('2026-08-01', '2026-08-31', withdrawals)).toBe(500)
  })

  it('inclui retiradas exatamente na data de início e na de fim do período', () => {
    const withdrawals = [
      makeWithdrawal({ withdrawalDate: '2026-08-01', amountCents: 100 }),
      makeWithdrawal({ withdrawalDate: '2026-08-31', amountCents: 200 }),
    ]

    expect(calculateWithdrawalsForPeriod('2026-08-01', '2026-08-31', withdrawals)).toBe(300)
  })

  it('devolve 0 quando não há retiradas no período', () => {
    expect(calculateWithdrawalsForPeriod('2026-08-01', '2026-08-31', [])).toBe(0)
  })
})
