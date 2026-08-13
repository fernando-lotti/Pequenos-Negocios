import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { NewPaymentMethodInput, PaymentMethod } from './types'

interface PaymentMethodRow {
  id: string
  business_id: string
  name: string
  fee_percent: number
  is_active: boolean
  created_at: string
}

function mapRow(row: PaymentMethodRow): PaymentMethod {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    feePercent: row.fee_percent,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export function usePaymentMethods(businessId: string) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Erro ao carregar formas de pagamento:', fetchError)
      setError('Não foi possível carregar as formas de pagamento agora.')
    } else {
      setPaymentMethods((data ?? []).map(mapRow))
      setError(null)
    }
    setIsLoading(false)
  }, [businessId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createPaymentMethod(input: NewPaymentMethodInput): Promise<PaymentMethod> {
    const { data, error: insertError } = await supabase
      .from('payment_methods')
      .insert({ business_id: businessId, name: input.name, fee_percent: input.feePercent })
      .select()
      .single()
    if (insertError) throw insertError
    const paymentMethod = mapRow(data as PaymentMethodRow)
    setPaymentMethods((current) => [...current, paymentMethod])
    return paymentMethod
  }

  async function updatePaymentMethod(id: string, input: NewPaymentMethodInput): Promise<void> {
    const { error: updateError } = await supabase
      .from('payment_methods')
      .update({ name: input.name, fee_percent: input.feePercent })
      .eq('id', id)
    if (updateError) throw updateError
    setPaymentMethods((current) =>
      current.map((method) => (method.id === id ? { ...method, name: input.name, feePercent: input.feePercent } : method)),
    )
  }

  // Exclusão de verdade, mesmo padrão de cost_categories/revenue_categories
  // — lançamentos que usavam essa forma de pagamento ficam "sem forma de
  // pagamento" (on delete set null em revenue_entries.payment_method_id,
  // ver schema.sql), não são apagados nem bloqueiam a exclusão.
  async function deletePaymentMethod(id: string): Promise<void> {
    const { error: deleteError } = await supabase.from('payment_methods').delete().eq('id', id)
    if (deleteError) throw deleteError
    setPaymentMethods((current) => current.filter((method) => method.id !== id))
  }

  return { paymentMethods, isLoading, error, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, refresh }
}
