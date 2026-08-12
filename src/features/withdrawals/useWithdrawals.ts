import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Withdrawal } from './types'

interface WithdrawalRow {
  id: string
  business_id: string
  withdrawal_date: string
  amount_cents: number
  notes: string | null
  created_at: string
}

function mapRow(row: WithdrawalRow): Withdrawal {
  return {
    id: row.id,
    businessId: row.business_id,
    withdrawalDate: row.withdrawal_date,
    amountCents: row.amount_cents,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export interface NewWithdrawalInput {
  withdrawalDate: string
  amountCents: number
  notes?: string | null
}

export function useWithdrawals(businessId: string) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('business_id', businessId)
      .order('withdrawal_date', { ascending: false })

    if (fetchError) {
      console.error('Erro ao carregar retiradas:', fetchError)
      setError('Não foi possível carregar as retiradas agora.')
    } else {
      setWithdrawals((data ?? []).map(mapRow))
      setError(null)
    }
    setIsLoading(false)
  }, [businessId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createWithdrawal(input: NewWithdrawalInput): Promise<Withdrawal> {
    const { data, error: insertError } = await supabase
      .from('withdrawals')
      .insert({
        business_id: businessId,
        withdrawal_date: input.withdrawalDate,
        amount_cents: input.amountCents,
        notes: input.notes ?? null,
      })
      .select()
      .single()
    if (insertError) throw insertError
    const withdrawal = mapRow(data as WithdrawalRow)
    setWithdrawals((current) => [withdrawal, ...current])
    return withdrawal
  }

  async function updateWithdrawal(id: string, input: NewWithdrawalInput): Promise<Withdrawal> {
    const { data, error: updateError } = await supabase
      .from('withdrawals')
      .update({
        withdrawal_date: input.withdrawalDate,
        amount_cents: input.amountCents,
        notes: input.notes ?? null,
      })
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    const updated = mapRow(data as WithdrawalRow)
    setWithdrawals((current) => current.map((withdrawal) => (withdrawal.id === id ? updated : withdrawal)))
    return updated
  }

  async function deleteWithdrawal(id: string): Promise<void> {
    const { error: deleteError } = await supabase.from('withdrawals').delete().eq('id', id)
    if (deleteError) throw deleteError
    setWithdrawals((current) => current.filter((withdrawal) => withdrawal.id !== id))
  }

  return { withdrawals, isLoading, error, createWithdrawal, updateWithdrawal, deleteWithdrawal, refresh }
}
