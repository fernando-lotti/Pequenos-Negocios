import { getMonthKeyFromIsoDate } from '../../lib/date'
import type { CostEntry, CostKind } from '../costs/types'
import type { RevenueEntry } from '../revenue/types'
import type { Withdrawal } from '../withdrawals/types'

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
  // Soma da "Quantidade" (opcional) informada nos lançamentos de receita do
  // mês — só conta quem preencheu esse campo.
  unitsSoldTotal: number
  // Margem média por unidade vendida/atendimento: (receita − custo
  // variável conhecido) dividido pelas unidades vendidas no mês. Não
  // desconta custo fixo nem "sem categoria" (ver ADR em docs/ARCHITECTURE.md)
  // porque margem, por definição, é só sobre o custo variável de uma
  // unidade (ver GLOSSARY.md). É `null` quando ninguém preencheu
  // "Quantidade" em nenhuma receita do mês — sem isso não dá pra calcular.
  marginPerUnitCents: number | null
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
  const monthRevenueEntries = revenueEntries.filter((entry) => getMonthKeyFromIsoDate(entry.revenueDate) === monthKey)

  const revenueCents = monthRevenueEntries.reduce((total, entry) => total + entry.amountCents, 0)

  const unitsSoldTotal = monthRevenueEntries.reduce((total, entry) => total + (entry.unitsSold ?? 0), 0)

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

  const marginPerUnitCents =
    unitsSoldTotal > 0 ? Math.round((revenueCents - variableCostCents) / unitsSoldTotal) : null

  return {
    monthKey,
    revenueCents,
    fixedCostCents,
    variableCostCents,
    uncategorizedCostCents,
    totalCostCents,
    profitCents: revenueCents - totalCostCents,
    unitsSoldTotal,
    marginPerUnitCents,
  }
}

/**
 * Caixa acumulado (histórico completo, não só do mês) — ver DailyCashSummary.tsx.
 *
 * Retirada de caixa (ver src/features/withdrawals) reduz o caixa disponível
 * igual um custo, mas não é passada pra calculateMonthlyProfit — não é um
 * gasto do negócio, é só dinheiro que já saiu do caixa pro bolso do dono.
 */
export function calculateAccumulatedCash(
  costEntries: CostEntry[],
  revenueEntries: RevenueEntry[],
  withdrawals: Withdrawal[],
): number {
  const totalRevenueCents = revenueEntries.reduce((total, entry) => total + entry.amountCents, 0)
  const totalCostCents = costEntries.reduce((total, entry) => total + entry.amountCents, 0)
  const totalWithdrawalCents = withdrawals.reduce((total, withdrawal) => total + withdrawal.amountCents, 0)
  return totalRevenueCents - totalCostCents - totalWithdrawalCents
}

/** Soma das retiradas de um mês específico — usada nos relatórios, separado dos custos. */
export function calculateMonthlyWithdrawals(monthKey: string, withdrawals: Withdrawal[]): number {
  return withdrawals
    .filter((withdrawal) => getMonthKeyFromIsoDate(withdrawal.withdrawalDate) === monthKey)
    .reduce((total, withdrawal) => total + withdrawal.amountCents, 0)
}
