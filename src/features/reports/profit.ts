import type { CostEntry, CostKind } from '../costs/types'
import type { RevenueEntry } from '../revenue/types'
import type { Withdrawal } from '../withdrawals/types'

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
  // Soma das taxas de forma de pagamento (Pix, Débito, Crédito...) sobre as
  // receitas do período — ver PaymentMethodManager.tsx. Descontada do
  // lucro à parte dos custos fixos/variáveis porque não é um cost_entry
  // lançado pelo usuário, é calculada ao vivo a partir da forma de
  // pagamento escolhida em cada receita (ver ADR em docs/ARCHITECTURE.md).
  cardFeeCents: number
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
  categoryKindById: Map<string, CostKind>,
  feePercentByPaymentMethodId: Map<string, number> = new Map(),
): ProfitBreakdown {
  const periodRevenueEntries = revenueEntries.filter(
    (entry) => entry.revenueDate >= startDate && entry.revenueDate <= endDate,
  )

  const revenueCents = periodRevenueEntries.reduce((total, entry) => total + entry.amountCents, 0)

  const unitsSoldTotal = periodRevenueEntries.reduce((total, entry) => total + (entry.unitsSold ?? 0), 0)

  const cardFeeCents = periodRevenueEntries.reduce((total, entry) => {
    const feePercent = entry.paymentMethodId ? feePercentByPaymentMethodId.get(entry.paymentMethodId) : undefined
    if (!feePercent) return total
    return total + Math.round((entry.amountCents * feePercent) / 100)
  }, 0)

  let fixedCostCents = 0
  let variableCostCents = 0
  let uncategorizedCostCents = 0

  for (const entry of costEntries) {
    if (entry.costDate < startDate || entry.costDate > endDate) continue
    const kind = entry.costCategoryId ? categoryKindById.get(entry.costCategoryId) : undefined
    if (kind === 'fixed') fixedCostCents += entry.amountCents
    else if (kind === 'variable') variableCostCents += entry.amountCents
    else uncategorizedCostCents += entry.amountCents
  }

  const totalCostCents = fixedCostCents + variableCostCents + uncategorizedCostCents

  const marginPerUnitCents =
    unitsSoldTotal > 0 ? Math.round((revenueCents - variableCostCents) / unitsSoldTotal) : null

  return {
    startDate,
    endDate,
    revenueCents,
    fixedCostCents,
    variableCostCents,
    uncategorizedCostCents,
    cardFeeCents,
    totalCostCents,
    profitCents: revenueCents - totalCostCents - cardFeeCents,
    unitsSoldTotal,
    marginPerUnitCents,
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
  feePercentByPaymentMethodId: Map<string, number> = new Map(),
): number {
  const totalRevenueCents = revenueEntries.reduce((total, entry) => total + entry.amountCents, 0)
  const totalCostCents = costEntries.reduce((total, entry) => total + entry.amountCents, 0)
  const totalWithdrawalCents = withdrawals.reduce((total, withdrawal) => total + withdrawal.amountCents, 0)
  // Mesmo cálculo de cardFeeCents em calculateProfitForPeriod, mas sobre o
  // histórico inteiro — o dinheiro que a maquininha desconta nunca chega a
  // entrar no caixa de verdade, então precisa sair daqui também, não só do
  // lucro (ver ADR em docs/ARCHITECTURE.md).
  const totalCardFeeCents = revenueEntries.reduce((total, entry) => {
    const feePercent = entry.paymentMethodId ? feePercentByPaymentMethodId.get(entry.paymentMethodId) : undefined
    if (!feePercent) return total
    return total + Math.round((entry.amountCents * feePercent) / 100)
  }, 0)
  return totalRevenueCents - totalCostCents - totalWithdrawalCents - totalCardFeeCents
}

/** Soma das retiradas de um período (mesmo intervalo inclusivo usado em calculateProfitForPeriod) — usada nos relatórios, separado dos custos. */
export function calculateWithdrawalsForPeriod(startDate: string, endDate: string, withdrawals: Withdrawal[]): number {
  return withdrawals
    .filter((withdrawal) => withdrawal.withdrawalDate >= startDate && withdrawal.withdrawalDate <= endDate)
    .reduce((total, withdrawal) => total + withdrawal.amountCents, 0)
}
