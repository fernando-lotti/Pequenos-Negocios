export interface RevenueEntry {
  id: string
  businessId: string
  revenueDate: string
  amountCents: number
  unitsSold: number | null
  paymentMethod: string | null
  notes: string | null
  createdAt: string
}
