// Função pura (sem chamada ao Supabase) — ver CODING_STANDARDS.md, "Cálculos
// financeiros". Transforma números que o app já calcula em avisos ativos,
// reforçando o caráter educativo do produto (ver CLAUDE.md). Regras
// simples de propósito — não é um sistema de "score financeiro".
export interface FinancialAlert {
  id: string
  message: string
}

// Acima desse limite, os custos fixos já tomam mais da metade de tudo que
// entrou — sinal de que vale revisar preço de venda ou custos fixos antes
// que um mês mais fraco vire prejuízo. Limiar de referência, não uma regra
// contábil rígida.
const FIXED_COST_RATIO_THRESHOLD = 0.5

export interface FinancialAlertsInput {
  fixedCostCents: number
  revenueCents: number
  cashCents: number
  workingCapitalGoalCents: number | null
}

export function calculateFinancialAlerts(input: FinancialAlertsInput): FinancialAlert[] {
  const alerts: FinancialAlert[] = []

  // Só avalia quando há receita no período — sem receita nenhuma, o
  // problema já é outro (e mais óbvio) do que "custo fixo alto".
  if (input.revenueCents > 0 && input.fixedCostCents / input.revenueCents > FIXED_COST_RATIO_THRESHOLD) {
    alerts.push({
      id: 'custo_fixo_alto',
      message:
        'Seus custos fixos estão consumindo mais da metade da receita deste período. Vale olhar se dá pra reduzir algum custo fixo ou se o preço de venda precisa subir.',
    })
  }

  if (input.workingCapitalGoalCents !== null && input.cashCents < input.workingCapitalGoalCents) {
    alerts.push({
      id: 'caixa_abaixo_da_meta',
      message:
        'Seu caixa está abaixo da meta de capital de giro que você definiu. Vale segurar novas retiradas até reforçar essa reserva.',
    })
  }

  return alerts
}
