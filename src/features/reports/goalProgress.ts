// Função pura (sem chamada ao Supabase) — ver CODING_STANDARDS.md, "Cálculos
// financeiros". Usada tanto pra meta de lucro quanto pra meta de
// faturamento: quem chama decide qual valor do mês (profitCents ou
// revenueCents, vindos de ProfitBreakdown) passar como currentCents.
export interface GoalProgress {
  // 0 a 1 — nunca passa de 1, mesmo que o valor atual já tenha superado a
  // meta, pra não estourar a barra de progresso visualmente.
  progressRatio: number
  remainingCents: number
  isReached: boolean
}

export function calculateGoalProgress(goalCents: number, currentCents: number): GoalProgress {
  if (goalCents <= 0) {
    return { progressRatio: 0, remainingCents: 0, isReached: false }
  }

  const progressRatio = Math.min(1, Math.max(0, currentCents / goalCents))
  const remainingCents = Math.max(0, goalCents - currentCents)

  return { progressRatio, remainingCents, isReached: currentCents >= goalCents }
}
