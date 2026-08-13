export interface PaymentMethod {
  id: string
  businessId: string
  name: string
  // 0 a 100 — taxa que a maquininha/banco cobra nessa forma de pagamento
  // (ex: 8 significa 8%). Descontada automaticamente do lucro e do caixa,
  // ver reports/profit.ts.
  feePercent: number
  isActive: boolean
  createdAt: string
}

export interface NewPaymentMethodInput {
  name: string
  feePercent: number
}
