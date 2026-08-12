export type BusinessType = 'service_provider' | 'product_seller'

// Regimes tributários reais do Brasil + "informal" pra quem ainda não tem
// CNPJ (boa parte do público do app). Não confundir com "porte" da empresa
// (ex: PME) — isso não é um regime tributário.
export type TaxRegime = 'informal' | 'mei' | 'simples_nacional' | 'lucro_presumido' | 'lucro_real'

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  informal: 'Informal (sem CNPJ)',
  mei: 'MEI',
  simples_nacional: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

export interface Business {
  id: string
  ownerId: string
  name: string
  businessType: BusinessType
  businessSubtype: string | null
  workingCapitalGoalCents: number | null
  // null quando o dono ainda não informou — só descritivo por enquanto,
  // não afeta nenhum cálculo (ver ADR em docs/ARCHITECTURE.md).
  taxRegime: TaxRegime | null
  createdAt: string
}

export interface NewBusinessInput {
  name: string
  businessType: BusinessType
  businessSubtype: string | null
}
