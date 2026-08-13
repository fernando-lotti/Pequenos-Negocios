import { addMonthsToIsoDate } from '../../lib/date'

// Função pura (sem chamada ao Supabase) — ver CODING_STANDARDS.md, "Cálculos
// financeiros". Usada pelo "parcelador automático" de custos (ver
// CostEntryForm.tsx): a partir de um valor total, quantidade de parcelas e
// data da 1ª parcela, devolve uma parcela por mês, uma parcela de cada vez.
export interface InstallmentPlanItem {
  date: string
  amountCents: number
}

export function calculateInstallmentPlan(
  totalCents: number,
  installmentCount: number,
  firstDueDate: string,
): InstallmentPlanItem[] {
  if (installmentCount <= 0) return []

  // Divisão pode não ser exata (ex: R$1.000 ÷ 3 = R$333,33...) — em vez de
  // arredondar cada parcela e perder/sobrar centavos no total, sobra de
  // centavos vai pras primeiras parcelas, uma a mais cada, até zerar. A
  // soma das parcelas sempre bate exatamente com totalCents.
  const baseCents = Math.floor(totalCents / installmentCount)
  const remainderCents = totalCents - baseCents * installmentCount

  return Array.from({ length: installmentCount }, (_, index) => ({
    date: addMonthsToIsoDate(firstDueDate, index),
    amountCents: baseCents + (index < remainderCents ? 1 : 0),
  }))
}
