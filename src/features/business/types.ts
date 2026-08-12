export type BusinessType = 'service_provider' | 'product_seller'

export interface Business {
  id: string
  ownerId: string
  name: string
  businessType: BusinessType
  businessSubtype: string | null
  workingCapitalGoalCents: number | null
  createdAt: string
}

export interface NewBusinessInput {
  name: string
  businessType: BusinessType
  businessSubtype: string | null
}
