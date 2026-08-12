import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CostCategory, CostKind } from './types'

interface CostCategoryRow {
  id: string
  business_id: string
  name: string
  kind: string
  unit_label: string | null
  is_active: boolean
  created_at: string
}

function mapRow(row: CostCategoryRow): CostCategory {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    kind: row.kind as CostKind,
    unitLabel: row.unit_label,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export function useCostCategories(businessId: string) {
  const [categories, setCategories] = useState<CostCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('cost_categories')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Erro ao carregar categorias de custo:', fetchError)
      setError('Não foi possível carregar as categorias de custo agora.')
    } else {
      setCategories((data ?? []).map(mapRow))
      setError(null)
    }
    setIsLoading(false)
  }, [businessId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createCategory(input: { name: string; kind: CostKind }): Promise<CostCategory> {
    const { data, error: insertError } = await supabase
      .from('cost_categories')
      .insert({ business_id: businessId, name: input.name, kind: input.kind })
      .select()
      .single()
    if (insertError) throw insertError
    const category = mapRow(data as CostCategoryRow)
    setCategories((current) => [...current, category])
    return category
  }

  async function updateCategory(id: string, input: { name: string; kind: CostKind }): Promise<void> {
    const { error: updateError } = await supabase
      .from('cost_categories')
      .update({ name: input.name, kind: input.kind })
      .eq('id', id)
    if (updateError) throw updateError
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, name: input.name, kind: input.kind } : category)),
    )
  }

  // Exclusão de verdade — o banco está configurado com "on delete set null"
  // em cost_entries.cost_category_id (ver schema.sql), então lançamentos que
  // usavam essa categoria não são apagados: ficam "sem categoria" até
  // alguém reclassificá-los (ver CostCategoryManager.tsx e reports/profit.ts).
  async function deleteCategory(id: string): Promise<void> {
    const { error: deleteError } = await supabase.from('cost_categories').delete().eq('id', id)
    if (deleteError) throw deleteError
    setCategories((current) => current.filter((category) => category.id !== id))
  }

  return { categories, isLoading, error, createCategory, updateCategory, deleteCategory, refresh }
}
