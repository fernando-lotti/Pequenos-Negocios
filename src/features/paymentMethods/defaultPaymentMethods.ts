import type { NewPaymentMethodInput } from './types'

// Preset criado junto com todo negócio novo (ver useBusinesses.ts,
// createBusiness) — diferente das categorias de custo/receita, não depende
// do tipo/subtipo de negócio: qualquer negócio pode receber por Pix ou
// cartão. São só taxas de referência, editáveis a qualquer momento em
// Ajustes (ver PaymentMethodManager.tsx) — a taxa real varia por
// maquininha/banco/plano de cada pessoa.
export const DEFAULT_PAYMENT_METHODS: NewPaymentMethodInput[] = [
  { name: 'Dinheiro', feePercent: 0 },
  { name: 'Pix', feePercent: 0 },
  { name: 'Débito', feePercent: 3 },
  { name: 'Crédito à vista', feePercent: 5 },
  { name: 'Crédito parcelado', feePercent: 8 },
]
