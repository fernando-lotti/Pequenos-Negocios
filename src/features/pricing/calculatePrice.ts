// Função pura (sem chamada ao Supabase) — ver CODING_STANDARDS.md, "Cálculos
// financeiros". Usa a mesma definição de "margem" já usada em
// reports/profit.ts (valor em R$ que sobra por unidade, não uma
// porcentagem), pra não introduzir um segundo significado do termo no app
// (ver GLOSSARY.md).
export interface SuggestedPrice {
  priceCents: number
  // Quanto a margem representa do preço final, em porcentagem (0-100) —
  // só um dado extra pra ajudar a pessoa a comparar preços entre produtos
  // diferentes. É `null` quando o preço sugerido é 0 (custo e margem
  // zerados), pra não dividir por zero.
  marginPercentOfPrice: number | null
}

export function calculateSuggestedPrice(costCents: number, desiredMarginCents: number): SuggestedPrice {
  const priceCents = costCents + desiredMarginCents
  const marginPercentOfPrice = priceCents > 0 ? (desiredMarginCents / priceCents) * 100 : null
  return { priceCents, marginPercentOfPrice }
}
