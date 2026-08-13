import { describe, expect, it } from 'vitest'
import { rankCostsByCategory, sumCostEntriesCents, totalsByCategory } from './calculations'
import type { CostCategory, CostEntry } from './types'

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

function makeCategory(overrides: Partial<CostCategory>): CostCategory {
  return {
    id: 'category-1',
    businessId: 'business-1',
    name: 'Categoria',
    kind: 'fixed',
    unitLabel: null,
    isActive: true,
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

describe('rankCostsByCategory', () => {
  it('ordena as categorias da maior pra menor gasto, com nome e porcentagem do total', () => {
    const entries = [
      makeEntry({ costCategoryId: 'a', amountCents: 1000 }),
      makeEntry({ costCategoryId: 'b', amountCents: 3000 }),
    ]
    const categories = [makeCategory({ id: 'a', name: 'Aluguel' }), makeCategory({ id: 'b', name: 'Embalagens' })]

    const ranking = rankCostsByCategory(entries, categories)

    expect(ranking).toEqual([
      { costCategoryId: 'b', name: 'Embalagens', totalCents: 3000, percentOfTotal: 75 },
      { costCategoryId: 'a', name: 'Aluguel', totalCents: 1000, percentOfTotal: 25 },
    ])
  })

  it('mostra "Sem categoria" pra lançamentos sem categoria (excluída)', () => {
    const entries = [makeEntry({ costCategoryId: null, amountCents: 500 })]
    const ranking = rankCostsByCategory(entries, [])
    expect(ranking).toEqual([{ costCategoryId: null, name: 'Sem categoria', totalCents: 500, percentOfTotal: 100 }])
  })

  it('devolve lista vazia quando não há nenhum custo lançado', () => {
    expect(rankCostsByCategory([], [])).toEqual([])
  })

  it('percentOfTotal fica 0 em vez de quebrar quando o total é 0', () => {
    // Caso hipotético (amountCents > 0 é obrigatório no banco), mas a função
    // não deve dividir por zero mesmo assim.
    const entries = [makeEntry({ costCategoryId: 'a', amountCents: 0 })]
    const ranking = rankCostsByCategory(entries, [makeCategory({ id: 'a', name: 'Aluguel' })])
    expect(ranking[0].percentOfTotal).toBe(0)
  })
})
