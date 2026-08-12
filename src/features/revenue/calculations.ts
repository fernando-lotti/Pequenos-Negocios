import type { RevenueCategory, RevenueEntry } from './types'

// Função pura (sem chamada ao Supabase) — ver CODING_STANDARDS.md, "Cálculos
// financeiros". Margem por produto: só para categorias com `unitCostCents`
// preenchido (ver RevenueCategoryManager.tsx) — é um relatório adicional,
// não entra em `calculateProfitForPeriod` (ver ADR em docs/ARCHITECTURE.md).
export interface ProductMargin {
  categoryId: string
  name: string
  revenueCents: number
  unitsSold: number
  costCents: number
  marginCents: number
  // null quando nenhuma receita dessa categoria, no período, teve
  // "Quantidade" preenchida — sem unidades vendidas não dá pra saber a
  // margem por unidade (mesma regra da margem média em reports/profit.ts).
  marginPerUnitCents: number | null
}

/** Recebe receitas já filtradas pelo período (ver ReportsPage.tsx) e as categorias do negócio. */
export function calculateProductMargins(revenueEntries: RevenueEntry[], categories: RevenueCategory[]): ProductMargin[] {
  return categories
    .filter((category): category is RevenueCategory & { unitCostCents: number } => category.unitCostCents !== null)
    .map((category) => {
      const categoryEntries = revenueEntries.filter((entry) => entry.revenueCategoryId === category.id)
      const revenueCents = categoryEntries.reduce((total, entry) => total + entry.amountCents, 0)
      const unitsSold = categoryEntries.reduce((total, entry) => total + (entry.unitsSold ?? 0), 0)
      const costCents = unitsSold * category.unitCostCents
      const marginCents = revenueCents - costCents

      return {
        categoryId: category.id,
        name: category.name,
        revenueCents,
        unitsSold,
        costCents,
        marginCents,
        marginPerUnitCents: unitsSold > 0 ? Math.round(marginCents / unitsSold) : null,
      }
    })
    .filter((productMargin) => productMargin.unitsSold > 0)
    .sort((a, b) => b.marginCents - a.marginCents)
}
