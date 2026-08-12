import { getMonthKeyFromIsoDate } from '../../lib/date'
import type { CostEntry, CostKind } from '../costs/types'
import type { RevenueEntry } from '../revenue/types'

export interface MonthlyProfitBreakdown {
  monthKey: string
  revenueCents: number
  fixedCostCents: number
  variableCostCents: number
  // Lançamentos cuja categoria foi excluída (ver CostCategoryManager.tsx) —
  // o valor gasto continua contando no lucro, só não sabemos se era custo
  // fixo ou variável até alguém reclassificar o lançamento.
  uncategorizedCostCents: number
  totalCostCents: number
  profitCents: number
}

// Função pura, sem chamada ao Supabase — recebe os lançamentos já
// carregados e sempre recalcula do zero. Este produto nunca tranca o
// passado (ver docs/ARCHITECTURE.md): não existe "lucro fechado" salvo em
// lugar nenhum, editar um lançamento de um mês qualquer muda o resultado
// na próxima vez que esta função rodar.
export function calculateMonthlyProfit(
  monthKey: string,
  costEntries: CostEntry[],
  revenueEntries: RevenueEntry[],
  categoryKindById: Map<string, CostKind>,
): MonthlyProfitBreakdown {
  const revenueCents = revenueEntries
    .filter((entry) => getMonthKeyFromIsoDate(entry.revenueDate) === monthKey)
    .reduce((total, entry) => total + entry.amountCents, 0)

  let fixedCostCents = 0
  let variableCostCents = 0
  let uncategorizedCostCents = 0

  for (const entry of costEntries) {
    if (getMonthKeyFromIsoDate(entry.costDate) !== monthKey) continue
    const kind = entry.costCategoryId ? categoryKindById.get(entry.costCategoryId) : undefined
    if (kind === 'fixed') fixedCostCents += entry.amountCents
    else if (kind === 'variable') variableCostCents += entry.amountCents
    else uncategorizedCostCents += entry.amountCents
  }

  const totalCostCents = fixedCostCents + variableCostCents + uncategorizedCostCents

  return {
    monthKey,
    revenueCents,
    fixedCostCents,
    variableCostCents,
    uncategorizedCostCents,
    totalCostCents,
    profitCents: revenueCents - totalCostCents,
  }
}

/** Caixa acumulado (histórico completo, não só do mês) — ver DailyCashSummary.tsx. */
export function calculateAccumulatedCash(costEntries: CostEntry[], revenueEntries: RevenueEntry[]): number {
  const totalRevenueCents = revenueEntries.reduce((total, entry) => total + entry.amountCents, 0)
  const totalCostCents = costEntries.reduce((total, entry) => total + entry.amountCents, 0)
  return totalRevenueCents - totalCostCents
}
