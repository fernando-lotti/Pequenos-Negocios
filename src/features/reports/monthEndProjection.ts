// Função pura (sem chamada ao Supabase) — ver CODING_STANDARDS.md, "Cálculos
// financeiros". Projeta receita/custo/lucro até o fim do mês, assumindo que
// o ritmo diário observado até hoje se mantém pelos dias que faltam. É uma
// estimativa simples (média linear), não uma previsão sofisticada — por
// isso a UI deixa claro que é "projeção", não fato (ver MonthEndProjectionCard.tsx).
export interface MonthEndProjection {
  projectedRevenueCents: number
  projectedCostCents: number
  projectedProfitCents: number
}

export function calculateMonthEndProjection(
  revenueSoFarCents: number,
  costSoFarCents: number,
  daysElapsed: number,
  daysInMonth: number,
): MonthEndProjection {
  // Nunca divide por 0 — no primeiro dia do mês, "dias já passados" já
  // conta como 1 (o próprio dia de hoje).
  const safeDaysElapsed = Math.max(1, daysElapsed)
  const scale = daysInMonth / safeDaysElapsed

  const projectedRevenueCents = Math.round(revenueSoFarCents * scale)
  const projectedCostCents = Math.round(costSoFarCents * scale)

  return {
    projectedRevenueCents,
    projectedCostCents,
    projectedProfitCents: projectedRevenueCents - projectedCostCents,
  }
}
