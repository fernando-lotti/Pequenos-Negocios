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

  async function renameCategory(id: string, name: string): Promise<void> {
    const { error: updateError } = await supabase.from('cost_categories').update({ name }).eq('id', id)
    if (updateError) throw updateError
    setCategories((current) => current.map((category) => (category.id === id ? { ...category, name } : category)))
  }

  // "Excluir" uma categoria só desativa (is_active = false) — nunca apagamos
  // de verdade, porque lançamentos antigos continuam apontando pra ela e
  // perderíamos o rótulo no histórico (ver docs/ai/GLOSSARY.md).
  async function setCategoryActive(id: string, isActive: boolean): Promise<void> {
    const { error: updateError } = await supabase.from('cost_categories').update({ is_active: isActive }).eq('id', id)
    if (updateError) throw updateError
    setCategories((current) => current.map((category) => (category.id === id ? { ...category, isActive } : category)))
  }

  return { categories, isLoading, error, createCategory, renameCategory, setCategoryActive, refresh }
}
