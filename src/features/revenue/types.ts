export interface RevenueCategory {
  id: string
  businessId: string
  name: string
  // Custo de produzir/comprar uma unidade — quando preenchido, essa
  // categoria vira um "produto" com margem individual calculável (ver
  // reports/ProductMarginCard.tsx). Opcional: nem todo negócio (ou
  // categoria) precisa disso.
  unitCostCents: number | null
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
