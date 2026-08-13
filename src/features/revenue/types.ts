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
  // null quando não tem forma de pagamento escolhida, ou quando ela foi
  // excluída (ver PaymentMethodManager.tsx) — mesmo tratamento de
  // revenueCategoryId.
  paymentMethodId: string | null
  revenueDate: string
  amountCents: number
  unitsSold: number | null
  notes: string | null
  createdAt: string
}
