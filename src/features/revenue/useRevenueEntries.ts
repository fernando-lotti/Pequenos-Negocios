import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { RevenueEntry } from './types'

interface RevenueEntryRow {
  id: string
  business_id: string
  revenue_category_id: string | null
  revenue_date: string
  amount_cents: number
  units_sold: number | null
  payment_method: string | null
  notes: string | null
  created_at: string
}

function mapRow(row: RevenueEntryRow): RevenueEntry {
  return {
    id: row.id,
    businessId: row.business_id,
    revenueCategoryId: row.revenue_category_id,
    revenueDate: row.revenue_date,
    amountCents: row.amount_cents,
    unitsSold: row.units_sold,
    paymentMethod: row.payment_method,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export interface NewRevenueEntryInput {
  revenueCategoryId?: string | null
  revenueDate: string
  amountCents: number
  unitsSold?: number | null
  notes?: string | null
}

export function useRevenueEntries(businessId: string) {
  const [entries, setEntries] = useState<RevenueEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('revenue_entries')
      .select('*')
      .eq('business_id', businessId)
      .order('revenue_date', { ascending: false })

    if (fetchError) {
      console.error('Erro ao carregar receitas:', fetchError)
      setError('Não foi possível carregar as receitas agora.')
    } else {
      setEntries((data ?? []).map(mapRow))
      setError(null)
    }
    setIsLoading(false)
  }, [businessId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createEntry(input: NewRevenueEntryInput): Promise<RevenueEntry> {
    const { data, error: insertError } = await supabase
      .from('revenue_entries')
      .insert({
        business_id: businessId,
        revenue_category_id: input.revenueCategoryId ?? null,
        revenue_date: input.revenueDate,
        amount_cents: input.amountCents,
        units_sold: input.unitsSold ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single()
    if (insertError) throw insertError
    const entry = mapRow(data as RevenueEntryRow)
    setEntries((current) => [entry, ...current])
    return entry
  }

  async function updateEntry(id: string, input: NewRevenueEntryInput): Promise<RevenueEntry> {
    const { data, error: updateError } = await supabase
      .from('revenue_entries')
      .update({
        revenue_category_id: input.revenueCategoryId ?? null,
        revenue_date: input.revenueDate,
        amount_cents: input.amountCents,
        units_sold: input.unitsSold ?? null,
        notes: input.notes ?? null,
      })
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    const updated = mapRow(data as RevenueEntryRow)
    setEntries((current) => current.map((entry) => (entry.id === id ? updated : entry)))
    return updated
  }

  async function deleteEntry(id: string): Promise<void> {
    const { error: deleteError } = await supabase.from('revenue_entries').delete().eq('id', id)
    if (deleteError) throw deleteError
    setEntries((current) => current.filter((entry) => entry.id !== id))
  }

  return { entries, isLoading, error, createEntry, updateEntry, deleteEntry, refresh }
}
