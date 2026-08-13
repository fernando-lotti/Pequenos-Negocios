import type { CostCategory, CostEntry } from './types'

export function sumCostEntriesCents(entries: CostEntry[]): number {
  return entries.reduce((total, entry) => total + entry.amountCents, 0)
}

export interface CategoryTotal {
  costCategoryId: string | null
  totalCents: number
}

/** Soma os lançamentos por categoria — usado pra mostrar "quanto já gastei em cada categoria". */
export function totalsByCategory(entries: CostEntry[]): CategoryTotal[] {
  const totals = new Map<string | null, number>()
  for (const entry of entries) {
    totals.set(entry.costCategoryId, (totals.get(entry.costCategoryId) ?? 0) + entry.amountCents)
  }
  return Array.from(totals.entries()).map(([costCategoryId, totalCents]) => ({ costCategoryId, totalCents }))
}

export interface CategoryRanking extends CategoryTotal {
  name: string
  // 0 a 100 — quanto essa categoria representa do total de custos do
  // período. 0 quando não há custo nenhum no período (evita dividir por 0).
  percentOfTotal: number
}

// Toda categoria que ainda aparece num lançamento existe em `categories` —
// excluir uma categoria de verdade zera cost_category_id nos lançamentos
// que a usavam (on delete set null, ver schema.sql), então não sobra
// referência "órfã". Mesmo assim, cai pra 'Sem categoria' por segurança.
const UNCATEGORIZED_LABEL = 'Sem categoria'

/** Ranking de categorias de custo do maior pro menor gasto — usado em "pra onde seu dinheiro está indo". */
export function rankCostsByCategory(entries: CostEntry[], categories: CostCategory[]): CategoryRanking[] {
  const totals = totalsByCategory(entries)
  const totalCents = totals.reduce((sum, total) => sum + total.totalCents, 0)
  const nameById = new Map(categories.map((category) => [category.id, category.name]))

  return totals
    .map((total) => ({
      ...total,
      name: total.costCategoryId ? (nameById.get(total.costCategoryId) ?? UNCATEGORIZED_LABEL) : UNCATEGORIZED_LABEL,
      percentOfTotal: totalCents > 0 ? (total.totalCents / totalCents) * 100 : 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents)
}
