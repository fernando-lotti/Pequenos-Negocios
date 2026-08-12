import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DEFAULT_PAYMENT_METHODS } from '../paymentMethods/defaultPaymentMethods'
import { getCostCategoryPreset, getRevenueCategoryPreset } from './businessTypePresets'
import type { Business, NewBusinessInput } from './types'

// Guardamos qual negócio está "ativo" no localStorage — é uma preferência
// de navegação da pessoa, não um dado do negócio em si, então não precisa
// estar no banco (ver ADR "Multi-negócio é first-class na UI").
const ACTIVE_BUSINESS_STORAGE_KEY = 'active_business_id'

interface BusinessRow {
  id: string
  owner_id: string
  name: string
  business_type: string
  business_subtype: string | null
  working_capital_goal_cents: number | null
  created_at: string
}

function mapRowToBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    businessType: row.business_type as Business['businessType'],
    businessSubtype: row.business_subtype,
    workingCapitalGoalCents: row.working_capital_goal_cents,
    createdAt: row.created_at,
  }
}

export interface UseBusinessesResult {
  businesses: Business[]
  activeBusiness: Business | null
  isLoading: boolean
  error: string | null
  setActiveBusinessId: (id: string) => void
  createBusiness: (input: NewBusinessInput) => Promise<Business>
  refresh: () => Promise<void>
}

export function useBusinesses(userId: string | null): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY),
  )

  const refresh = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Erro ao carregar negócios:', fetchError)
      setError('Não foi possível carregar seus negócios agora. Tente recarregar a página.')
    } else {
      setBusinesses((data ?? []).map(mapRowToBusiness))
      setError(null)
    }
    setIsLoading(false)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  function setActiveBusinessId(id: string) {
    localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, id)
    setActiveBusinessIdState(id)
  }

  async function createBusiness(input: NewBusinessInput): Promise<Business> {
    if (!userId) throw new Error('Usuário não autenticado')

    const { data, error: insertError } = await supabase
      .from('businesses')
      .insert({
        owner_id: userId,
        name: input.name,
        business_type: input.businessType,
        business_subtype: input.businessSubtype,
      })
      .select()
      .single()

    if (insertError) throw insertError
    const business = mapRowToBusiness(data as BusinessRow)

    // Seed das categorias de custo sugeridas pro subtipo escolhido — é só o
    // ponto de partida, o usuário edita/remove/cria categorias livremente
    // depois (ver businessTypePresets.ts).
    const preset = getCostCategoryPreset(input.businessSubtype)
    if (preset.length > 0) {
      const { error: seedError } = await supabase.from('cost_categories').insert(
        preset.map((category) => ({
          business_id: business.id,
          name: category.name,
          kind: category.kind,
        })),
      )
      if (seedError) {
        // Não interrompe o fluxo: o negócio já foi criado, e dá pra criar
        // categorias na mão se o seed falhar por algum motivo.
        console.error('Erro ao criar categorias de custo sugeridas:', seedError)
      }
    }

    // Mesma lógica pro seed de categorias de receita (ver businessTypePresets.ts)
    // — só existe sugestão pra alguns subtipos, como pipoqueiro.
    const revenueCategoryNames = getRevenueCategoryPreset(input.businessSubtype)
    if (revenueCategoryNames.length > 0) {
      const { error: revenueSeedError } = await supabase.from('revenue_categories').insert(
        revenueCategoryNames.map((name) => ({
          business_id: business.id,
          name,
        })),
      )
      if (revenueSeedError) {
        console.error('Erro ao criar categorias de receita sugeridas:', revenueSeedError)
      }
    }

    // Seed das formas de pagamento (Pix, Débito, Crédito...) com taxas de
    // referência — diferente das categorias, não depende do tipo/subtipo de
    // negócio (ver defaultPaymentMethods.ts). Também só o ponto de partida,
    // totalmente editável depois em Ajustes.
    const { error: paymentMethodSeedError } = await supabase.from('payment_methods').insert(
      DEFAULT_PAYMENT_METHODS.map((method) => ({
        business_id: business.id,
        name: method.name,
        fee_percent: method.feePercent,
      })),
    )
    if (paymentMethodSeedError) {
      console.error('Erro ao criar formas de pagamento sugeridas:', paymentMethodSeedError)
    }

    setBusinesses((current) => [...current, business])
    setActiveBusinessId(business.id)
    return business
  }

  const activeBusiness =
    businesses.find((business) => business.id === activeBusinessId) ?? businesses[0] ?? null

  return { businesses, activeBusiness, isLoading, error, setActiveBusinessId, createBusiness, refresh }
}
