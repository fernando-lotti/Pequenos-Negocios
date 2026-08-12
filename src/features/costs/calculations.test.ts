import { describe, expect, it } from 'vitest'
import { sumCostEntriesCents, totalsByCategory } from './calculations'
import type { CostEntry } from './types'

function makeEntry(overrides: Partial<CostEntry>): CostEntry {
  return {
    id: 'entry-1',
    businessId: 'business-1',
    costCategoryId: 'category-1',
    costDate: '2026-08-01',
    amountCents: 1000,
    quantity: null,
    notes: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('sumCostEntriesCents', () => {
  it('soma os valores de todos os lançamentos', () => {
    const entries = [makeEntry({ amountCents: 1000 }), makeEntry({ amountCents: 2500 })]
    expect(sumCostEntriesCents(entries)).toBe(3500)
  })

  it('devolve 0 para lista vazia', () => {
    expect(sumCostEntriesCents([])).toBe(0)
  })
})

describe('totalsByCategory', () => {
  it('agrupa e soma os lançamentos por categoria', () => {
    const entries = [
      makeEntry({ costCategoryId: 'a', amountCents: 1000 }),
      makeEntry({ costCategoryId: 'a', amountCents: 500 }),
      makeEntry({ costCategoryId: 'b', amountCents: 2000 }),
    ]
    const totals = totalsByCategory(entries)
    expect(totals).toHaveLength(2)
    expect(totals.find((total) => total.costCategoryId === 'a')?.totalCents).toBe(1500)
    expect(totals.find((total) => total.costCategoryId === 'b')?.totalCents).toBe(2000)
  })
})
