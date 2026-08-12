import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { RevenueCategory } from './types'

interface RevenueCategoryRow {
  id: string
  business_id: string
  name: string
  unit_cost_cents: number | null
  is_active: boolean
  created_at: string
}

function mapRow(row: RevenueCategoryRow): RevenueCategory {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    unitCostCents: row.unit_cost_cents,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export function useRevenueCategories(businessId: string) {
  const [categories, setCategories] = useState<RevenueCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('revenue_categories')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Erro ao carregar categorias de receita:', fetchError)
      setError('Não foi possível carregar as categorias de receita agora.')
    } else {
      setCategories((data ?? []).map(mapRow))
      setError(null)
    }
    setIsLoading(false)
  }, [businessId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createCategory(input: { name: string; unitCostCents?: number | null }): Promise<RevenueCategory> {
    const { data, error: insertError } = await supabase
      .from('revenue_categories')
      .insert({ business_id: businessId, name: input.name, unit_cost_cents: input.unitCostCents ?? null })
      .select()
      .single()
    if (insertError) throw insertError
    const category = mapRow(data as RevenueCategoryRow)
    setCategories((current) => [...current, category])
    return category
  }

  async function updateCategory(id: string, input: { name: string; unitCostCents?: number | null }): Promise<void> {
    const { error: updateError } = await supabase
      .from('revenue_categories')
      .update({ name: input.name, unit_cost_cents: input.unitCostCents ?? null })
      .eq('id', id)
    if (updateError) throw updateError
    setCategories((current) =>
      current.map((category) =>
        category.id === id ? { ...category, name: input.name, unitCostCents: input.unitCostCents ?? null } : category,
      ),
    )
  }

  // Exclusão de verdade — o banco tem "on delete set null" em
  // revenue_entries.revenue_category_id (ver schema.sql), então lançamentos
  // que usavam essa categoria não são apagados: ficam "sem categoria".
  async function deleteCategory(id: string): Promise<void> {
    const { error: deleteError } = await supabase.from('revenue_categories').delete().eq('id', id)
    if (deleteError) throw deleteError
    setCategories((current) => current.filter((category) => category.id !== id))
  }

  return { categories, isLoading, error, createCategory, updateCategory, deleteCategory, refresh }
}
