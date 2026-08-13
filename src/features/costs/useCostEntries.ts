import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { calculateInstallmentPlan } from './installments'
import type { CostEntry } from './types'

interface CostEntryRow {
  id: string
  business_id: string
  cost_category_id: string | null
  cost_date: string
  amount_cents: number
  quantity: number | null
  notes: string | null
  created_at: string
}

function mapRow(row: CostEntryRow): CostEntry {
  return {
    id: row.id,
    businessId: row.business_id,
    costCategoryId: row.cost_category_id,
    costDate: row.cost_date,
    amountCents: row.amount_cents,
    quantity: row.quantity,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export interface NewCostEntryInput {
  costCategoryId: string
  costDate: string
  amountCents: number
  quantity?: number | null
  notes?: string | null
}

export interface NewInstallmentPlanInput {
  costCategoryId: string
  totalCents: number
  installmentCount: number
  firstDueDate: string
  notes?: string | null
}

export function useCostEntries(businessId: string) {
  const [entries, setEntries] = useState<CostEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('cost_entries')
      .select('*')
      .eq('business_id', businessId)
      .order('cost_date', { ascending: false })

    if (fetchError) {
      console.error('Erro ao carregar custos:', fetchError)
      setError('Não foi possível carregar os custos agora.')
    } else {
      setEntries((data ?? []).map(mapRow))
      setError(null)
    }
    setIsLoading(false)
  }, [businessId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createEntry(input: NewCostEntryInput): Promise<CostEntry> {
    const { data, error: insertError } = await supabase
      .from('cost_entries')
      .insert({
        business_id: businessId,
        cost_category_id: input.costCategoryId,
        cost_date: input.costDate,
        amount_cents: input.amountCents,
        quantity: input.quantity ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single()
    if (insertError) throw insertError
    const entry = mapRow(data as CostEntryRow)
    setEntries((current) => [entry, ...current])
    return entry
  }

  // Cria um cost_entry por parcela, de uma vez só (ver installments.ts pro
  // cálculo de valor/data de cada parcela) — usado pelo "parcelador
  // automático" de compras financiadas (ex: uma máquina, um ar
  // condicionado). Cada parcela é um lançamento comum depois de criada,
  // editável/excluível individualmente como qualquer outro custo.
  async function createInstallments(input: NewInstallmentPlanInput): Promise<CostEntry[]> {
    const plan = calculateInstallmentPlan(input.totalCents, input.installmentCount, input.firstDueDate)

    const { data, error: insertError } = await supabase
      .from('cost_entries')
      .insert(
        plan.map((item, index) => ({
          business_id: businessId,
          cost_category_id: input.costCategoryId,
          cost_date: item.date,
          amount_cents: item.amountCents,
          notes: [input.notes?.trim() || null, `(parcela ${index + 1} de ${plan.length})`].filter(Boolean).join(' '),
        })),
      )
      .select()
    if (insertError) throw insertError
    const newEntries = (data as CostEntryRow[]).map(mapRow)
    setEntries((current) => [...newEntries, ...current])
    return newEntries
  }

  // Editar um lançamento de qualquer data (passada ou não) é sempre
  // permitido, pelo mesmo motivo do deleteEntry logo abaixo.
  async function updateEntry(id: string, input: NewCostEntryInput): Promise<CostEntry> {
    const { data, error: updateError } = await supabase
      .from('cost_entries')
      .update({
        cost_category_id: input.costCategoryId,
        cost_date: input.costDate,
        amount_cents: input.amountCents,
        quantity: input.quantity ?? null,
        notes: input.notes ?? null,
      })
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    const updated = mapRow(data as CostEntryRow)
    setEntries((current) => current.map((entry) => (entry.id === id ? updated : entry)))
    return updated
  }

  // Excluir um lançamento de qualquer data (passada ou não) é sempre
  // permitido: este produto nunca tranca o passado (ver docs/ARCHITECTURE.md)
  // — o lucro do mês é recalculado automaticamente na próxima leitura.
  async function deleteEntry(id: string): Promise<void> {
    const { error: deleteError } = await supabase.from('cost_entries').delete().eq('id', id)
    if (deleteError) throw deleteError
    setEntries((current) => current.filter((entry) => entry.id !== id))
  }

  return { entries, isLoading, error, createEntry, createInstallments, updateEntry, deleteEntry, refresh }
}
