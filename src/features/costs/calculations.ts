import type { CostEntry } from './types'

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
