import { describe, expect, it } from 'vitest'
import { calculateProductMargins } from './calculations'
import type { RevenueCategory, RevenueEntry } from './types'

function makeCategory(overrides: Partial<RevenueCategory>): RevenueCategory {
  return {
    id: 'category-1',
    businessId: 'business-1',
    name: 'Produto',
    unitCostCents: null,
    isActive: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeEntry(overrides: Partial<RevenueEntry>): RevenueEntry {
  return {
    id: 'entry-1',
    businessId: 'business-1',
    revenueCategoryId: 'category-1',
    revenueDate: '2026-08-05',
    amountCents: 1000,
    unitsSold: null,
    paymentMethod: null,
    notes: null,
    createdAt: '2026-08-05T00:00:00.000Z',
    ...overrides,
  }
}

describe('calculateProductMargins', () => {
  it('calcula receita, custo e margem por categoria com custo cadastrado', () => {
    const categories = [makeCategory({ id: 'pipoca-doce', name: 'Pipoca doce', unitCostCents: 200 })]
    const entries = [makeEntry({ revenueCategoryId: 'pipoca-doce', amountCents: 5000, unitsSold: 10 })]

    const result = calculateProductMargins(entries, categories)

    expect(result).toEqual([
      {
        categoryId: 'pipoca-doce',
        name: 'Pipoca doce',
        revenueCents: 5000,
        unitsSold: 10,
        costCents: 2000,
        marginCents: 3000,
        marginPerUnitCents: 300,
      },
    ])
  })

  it('soma vários lançamentos da mesma categoria no período', () => {
    const categories = [makeCategory({ id: 'a', unitCostCents: 100 })]
    const entries = [
      makeEntry({ revenueCategoryId: 'a', amountCents: 1000, unitsSold: 5 }),
      makeEntry({ revenueCategoryId: 'a', amountCents: 2000, unitsSold: 10 }),
    ]

    const result = calculateProductMargins(entries, categories)

    expect(result[0].revenueCents).toBe(3000)
    expect(result[0].unitsSold).toBe(15)
    expect(result[0].costCents).toBe(1500)
  })

  it('ignora categorias sem custo por unidade cadastrado', () => {
    const categories = [makeCategory({ id: 'a', unitCostCents: null })]
    const entries = [makeEntry({ revenueCategoryId: 'a', amountCents: 1000, unitsSold: 5 })]

    expect(calculateProductMargins(entries, categories)).toEqual([])
  })

  it('ignora categorias sem nenhuma unidade vendida no período (mesmo com custo cadastrado)', () => {
    const categories = [makeCategory({ id: 'a', unitCostCents: 100 })]
    const entries = [makeEntry({ revenueCategoryId: 'a', amountCents: 1000, unitsSold: null })]

    expect(calculateProductMargins(entries, categories)).toEqual([])
  })

  it('ordena do maior pro menor lucro (marginCents)', () => {
    const categories = [
      makeCategory({ id: 'a', name: 'A', unitCostCents: 100 }),
      makeCategory({ id: 'b', name: 'B', unitCostCents: 100 }),
    ]
    const entries = [
      makeEntry({ revenueCategoryId: 'a', amountCents: 1000, unitsSold: 5 }),
      makeEntry({ revenueCategoryId: 'b', amountCents: 5000, unitsSold: 5 }),
    ]

    const result = calculateProductMargins(entries, categories)
    expect(result.map((item) => item.name)).toEqual(['B', 'A'])
  })

  it('não conta lançamentos de outras categorias', () => {
    const categories = [makeCategory({ id: 'a', unitCostCents: 100 })]
    const entries = [makeEntry({ revenueCategoryId: 'outra-categoria', amountCents: 9999, unitsSold: 99 })]

    expect(calculateProductMargins(entries, categories)).toEqual([])
  })
})
