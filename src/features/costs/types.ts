export type CostKind = 'fixed' | 'variable'

export const COST_KIND_LABELS: Record<CostKind, string> = {
  fixed: 'Custo fixo',
  variable: 'Custo variável',
}

// Liga cada tipo de custo ao id da dica educativa correspondente (ver
// education/tips.ts) — usado pelo ícone "i" no seletor de tipo.
export const COST_KIND_CONCEPT_IDS: Record<CostKind, string> = {
  fixed: 'custo_fixo',
  variable: 'custo_variavel',
}

export interface CostCategory {
  id: string
  businessId: string
  name: string
  kind: CostKind
  unitLabel: string | null
  isActive: boolean
  createdAt: string
}

export interface CostEntry {
  id: string
  businessId: string
  costCategoryId: string
  costDate: string
  amountCents: number
  quantity: number | null
  notes: string | null
  createdAt: string
}
