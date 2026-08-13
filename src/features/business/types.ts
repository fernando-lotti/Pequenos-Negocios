export type BusinessType = 'service_provider' | 'product_seller'

// Meta mensal é sobre lucro líquido ou sobre faturamento (receita bruta) —
// ver MonthlyGoalForm.tsx e ADR em docs/ARCHITECTURE.md.
export type MonthlyGoalType = 'profit' | 'revenue'

export interface Business {
  id: string
  ownerId: string
  name: string
  businessType: BusinessType
  businessSubtype: string | null
  workingCapitalGoalCents: number | null
  monthlyGoalCents: number | null
  monthlyGoalType: MonthlyGoalType | null
  createdAt: string
}

export interface NewBusinessInput {
  name: string
  businessType: BusinessType
  businessSubtype: string | null
}

export interface MonthlyGoalInput {
  amountCents: number
  type: MonthlyGoalType
}
