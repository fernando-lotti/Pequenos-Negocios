export interface Withdrawal {
  id: string
  businessId: string
  withdrawalDate: string
  amountCents: number
  notes: string | null
  createdAt: string
}
