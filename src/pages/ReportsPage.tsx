import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { useCostCategories } from '../features/costs/useCostCategories'
import { useCostEntries } from '../features/costs/useCostEntries'
import { ConceptTip } from '../features/education/ConceptTip'
import { MonthlyProfitCard } from '../features/reports/MonthlyProfitCard'
import { calculateMonthlyProfit, calculateMonthlyWithdrawals } from '../features/reports/profit'
import { useRevenueEntries } from '../features/revenue/useRevenueEntries'
import { useWithdrawals } from '../features/withdrawals/useWithdrawals'
import { formatCurrencyBRL } from '../lib/currency'
import { getCurrentMonthKey } from '../lib/date'
import type { Business } from '../features/business/types'
import type { CostKind } from '../features/costs/types'

interface ReportsPageProps {
  business: Business
}

export function ReportsPage({ business }: ReportsPageProps) {
  const { categories } = useCostCategories(business.id)
  const { entries: costEntries, isLoading: isLoadingCosts } = useCostEntries(business.id)
  const { entries: revenueEntries, isLoading: isLoadingRevenue } = useRevenueEntries(business.id)
  const { withdrawals, isLoading: isLoadingWithdrawals } = useWithdrawals(business.id)
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey())

  const categoryKindById = useMemo(
    () => new Map<string, CostKind>(categories.map((category) => [category.id, category.kind])),
    [categories],
  )

  const breakdown = useMemo(
    () => calculateMonthlyProfit(monthKey, costEntries, revenueEntries, categoryKindById),
    [monthKey, costEntries, revenueEntries, categoryKindById],
  )

  const monthlyWithdrawalsCents = useMemo(
    () => calculateMonthlyWithdrawals(monthKey, withdrawals),
    [monthKey, withdrawals],
  )

  if (isLoadingCosts || isLoadingRevenue || isLoadingWithdrawals) {
    return <p className="p-4 text-sm text-slate-500">Carregando...</p>
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <h1 className="text-lg font-bold text-slate-900">Relatórios</h1>
      <ConceptTip conceptId="lucro_caixa" />

      <label className="flex w-fit flex-col gap-1 text-sm font-medium text-slate-700">
        Mês
        <input
          type="month"
          value={monthKey}
          onChange={(event) => setMonthKey(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <MonthlyProfitCard breakdown={breakdown} />

      <Card>
        <p className="text-sm text-slate-600">Retiradas do mês</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrencyBRL(monthlyWithdrawalsCents)}</p>
        <p className="mt-1 text-xs text-slate-500">
          Dinheiro que você tirou do caixa pra uso pessoal — não é um custo do negócio, por isso não aparece
          descontado do lucro acima.
        </p>
      </Card>

      <p className="text-xs text-slate-500">
        Estes números refletem os lançamentos atuais, incluindo edições recentes — este app nunca "tranca" um mês
        passado.
      </p>
    </div>
  )
}
