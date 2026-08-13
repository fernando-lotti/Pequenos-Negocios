import type { CostCategory, CostEntry } from '../costs/types'
import type { RevenueCategory, RevenueEntry } from '../revenue/types'
import type { Withdrawal } from '../withdrawals/types'

/** Total gasto/recebido numa categoria dentro do período — usado na quebra "por categoria" do relatório (ver issue #7). */
export interface CategoryAmount {
  // null representa a linha "Sem categoria" (categoria original foi excluída).
  categoryId: string | null
  name: string
  totalCents: number
}

/** Igual a CategoryAmount, mas só faz sentido pro lado da receita: também traz o preço médio daquela categoria. */
export interface RevenueCategoryAmount extends CategoryAmount {
  entryCount: number
  unitsSold: number
  avgPriceByCountCents: number
  avgPriceByUnitCents: number | null
}

export interface ProfitBreakdown {
  startDate: string
  endDate: string
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
  // Preço médio de venda: diferente da margem acima, não desconta custo —
  // é só "quanto entrou, em média, por lançamento/unidade" (ver issue #7).
  // avgSalePriceByCountCents é `null` quando não há receita no período;
  // avgSalePriceByUnitCents é `null` quando ninguém preencheu "Quantidade".
  avgSalePriceByCountCents: number | null
  avgSalePriceByUnitCents: number | null
  // Quebra de custo por categoria individual, na mesma ordem de criação em
  // que costCategories foi passado pra esta função (useCostCategories já
  // devolve nessa ordem). Categoria sem gasto no período fica de fora da
  // lista — não uma linha zerada.
  costByCategory: CategoryAmount[]
  // Mesma ideia, do lado da receita — cada categoria já vem com seu próprio
  // preço médio.
  revenueByCategory: RevenueCategoryAmount[]
}

// Função pura, sem chamada ao Supabase — recebe os lançamentos já
// carregados e sempre recalcula do zero. Este produto nunca tranca o
// passado (ver docs/ARCHITECTURE.md): não existe "lucro fechado" salvo em
// lugar nenhum, editar um lançamento de um período qualquer muda o
// resultado na próxima vez que esta função rodar.
//
// startDate e endDate são datas "AAAA-MM-DD" (mesmo formato salvo no banco)
// e o intervalo é inclusivo dos dois lados — dá pra comparar como texto
// porque esse formato ordena igual à data real.
export function calculateProfitForPeriod(
  startDate: string,
  endDate: string,
  costEntries: CostEntry[],
  revenueEntries: RevenueEntry[],
  costCategories: CostCategory[],
  revenueCategories: RevenueCategory[],
): ProfitBreakdown {
  const periodCostEntries = costEntries.filter((entry) => entry.costDate >= startDate && entry.costDate <= endDate)
  const periodRevenueEntries = revenueEntries.filter(
    (entry) => entry.revenueDate >= startDate && entry.revenueDate <= endDate,
  )

  const revenueCents = periodRevenueEntries.reduce((total, entry) => total + entry.amountCents, 0)

  const unitsSoldTotal = periodRevenueEntries.reduce((total, entry) => total + (entry.unitsSold ?? 0), 0)

  const costCategoryById = new Map(costCategories.map((category) => [category.id, category]))

  let fixedCostCents = 0
  let variableCostCents = 0
  let uncategorizedCostCents = 0
  const costTotalsByCategoryId = new Map<string, number>()

  for (const entry of periodCostEntries) {
    const category = entry.costCategoryId ? costCategoryById.get(entry.costCategoryId) : undefined
    if (category?.kind === 'fixed') fixedCostCents += entry.amountCents
    else if (category?.kind === 'variable') variableCostCents += entry.amountCents
    else uncategorizedCostCents += entry.amountCents

    if (entry.costCategoryId) {
      costTotalsByCategoryId.set(
        entry.costCategoryId,
        (costTotalsByCategoryId.get(entry.costCategoryId) ?? 0) + entry.amountCents,
      )
    }
  }

  const totalCostCents = fixedCostCents + variableCostCents + uncategorizedCostCents

  const costByCategory: CategoryAmount[] = costCategories
    .map((category) => ({
      categoryId: category.id,
      name: category.name,
      totalCents: costTotalsByCategoryId.get(category.id) ?? 0,
    }))
    .filter((item) => item.totalCents > 0)
  if (uncategorizedCostCents > 0) {
    costByCategory.push({ categoryId: null, name: 'Sem categoria', totalCents: uncategorizedCostCents })
  }

  const revenueStatsByCategoryId = new Map<string | null, { totalCents: number; entryCount: number; unitsSold: number }>()
  for (const entry of periodRevenueEntries) {
    const stats = revenueStatsByCategoryId.get(entry.revenueCategoryId) ?? {
      totalCents: 0,
      entryCount: 0,
      unitsSold: 0,
    }
    stats.totalCents += entry.amountCents
    stats.entryCount += 1
    stats.unitsSold += entry.unitsSold ?? 0
    revenueStatsByCategoryId.set(entry.revenueCategoryId, stats)
  }

  function toRevenueCategoryAmount(categoryId: string | null, name: string): RevenueCategoryAmount | null {
    const stats = revenueStatsByCategoryId.get(categoryId)
    if (!stats || stats.totalCents === 0) return null
    return {
      categoryId,
      name,
      totalCents: stats.totalCents,
      entryCount: stats.entryCount,
      unitsSold: stats.unitsSold,
      avgPriceByCountCents: Math.round(stats.totalCents / stats.entryCount),
      avgPriceByUnitCents: stats.unitsSold > 0 ? Math.round(stats.totalCents / stats.unitsSold) : null,
    }
  }

  const revenueByCategory: RevenueCategoryAmount[] = revenueCategories
    .map((category) => toRevenueCategoryAmount(category.id, category.name))
    .filter((item): item is RevenueCategoryAmount => item !== null)
  const uncategorizedRevenue = toRevenueCategoryAmount(null, 'Sem categoria')
  if (uncategorizedRevenue) revenueByCategory.push(uncategorizedRevenue)

  const marginPerUnitCents =
    unitsSoldTotal > 0 ? Math.round((revenueCents - variableCostCents) / unitsSoldTotal) : null

  const avgSalePriceByCountCents =
    periodRevenueEntries.length > 0 ? Math.round(revenueCents / periodRevenueEntries.length) : null
  const avgSalePriceByUnitCents = unitsSoldTotal > 0 ? Math.round(revenueCents / unitsSoldTotal) : null

  return {
    startDate,
    endDate,
    revenueCents,
    fixedCostCents,
    variableCostCents,
    uncategorizedCostCents,
    totalCostCents,
    profitCents: revenueCents - totalCostCents,
    unitsSoldTotal,
    marginPerUnitCents,
    avgSalePriceByCountCents,
    avgSalePriceByUnitCents,
    costByCategory,
    revenueByCategory,
  }
}

/** Data do lançamento (custo ou receita) mais antigo — usado no atalho "Desde o início" dos relatórios. */
export function getEarliestEntryDate(costEntries: CostEntry[], revenueEntries: RevenueEntry[]): string | null {
  const allDates = [...costEntries.map((entry) => entry.costDate), ...revenueEntries.map((entry) => entry.revenueDate)]
  if (allDates.length === 0) return null
  return allDates.reduce((earliest, date) => (date < earliest ? date : earliest))
}

/**
 * Caixa acumulado (histórico completo, não só do mês) — ver DailyCashSummary.tsx.
 *
 * Retirada de caixa (ver src/features/withdrawals) reduz o caixa disponível
 * igual um custo, mas não é passada pra calculateProfitForPeriod — não é um
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

/** Soma das retiradas de um período (mesmo intervalo inclusivo usado em calculateProfitForPeriod) — usada nos relatórios, separado dos custos. */
export function calculateWithdrawalsForPeriod(startDate: string, endDate: string, withdrawals: Withdrawal[]): number {
  return withdrawals
    .filter((withdrawal) => withdrawal.withdrawalDate >= startDate && withdrawal.withdrawalDate <= endDate)
    .reduce((total, withdrawal) => total + withdrawal.amountCents, 0)
}
