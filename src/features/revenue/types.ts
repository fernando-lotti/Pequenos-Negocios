export interface RevenueCategory {
  id: string
  businessId: string
  name: string
  isActive: boolean
  createdAt: string
}

export interface RevenueEntry {
  id: string
  businessId: string
  // null quando não tem categoria escolhida, ou quando a categoria original
  // foi excluída (ver RevenueCategoryManager.tsx) — o lançamento continua
  // contando no total de receita, só sem saber de qual produto/serviço veio.
  revenueCategoryId: string | null
  revenueDate: string
  amountCents: number
  unitsSold: number | null
  paymentMethod: string | null
  notes: string | null
  createdAt: string
}
