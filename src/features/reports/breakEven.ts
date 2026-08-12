// Função pura (sem chamada ao Supabase) — ver CODING_STANDARDS.md, "Cálculos
// financeiros". Ponto de equilíbrio = quantas unidades (vendas/atendimentos)
// são necessárias pra cobrir o custo fixo do período, usando a margem média
// por unidade que reports/profit.ts já calcula.
export type BreakEven =
  | { possible: false }
  | { possible: true; unitsNeeded: number; unitsRemaining: number; isReached: boolean }

export function calculateBreakEven(
  fixedCostCents: number,
  marginPerUnitCents: number,
  unitsSoldTotal: number,
): BreakEven {
  // Margem zero ou negativa significa que, em média, cada venda não cobre
  // nem o próprio custo variável — vender mais nessas condições não ajuda
  // a cobrir o custo fixo, então não existe um "número de vendas" que
  // resolva (ver ConceptTip em BreakEvenCard.tsx, que orienta a revisar
  // preço/custo em vez de só vender mais).
  if (marginPerUnitCents <= 0) return { possible: false }

  const unitsNeeded = Math.ceil(fixedCostCents / marginPerUnitCents)
  const unitsRemaining = Math.max(0, unitsNeeded - unitsSoldTotal)

  return { possible: true, unitsNeeded, unitsRemaining, isReached: unitsSoldTotal >= unitsNeeded }
}
