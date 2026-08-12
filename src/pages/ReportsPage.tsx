import { useMemo, useState } from 'react'
import { useCostCategories } from '../features/costs/useCostCategories'
import { useCostEntries } from '../features/costs/useCostEntries'
import { ConceptTip } from '../features/education/ConceptTip'
import { MonthlyProfitCard } from '../features/reports/MonthlyProfitCard'
import { calculateMonthlyProfit } from '../features/reports/profit'
import { useRevenueEntries } from '../features/revenue/useRevenueEntries'
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
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey())

  const categoryKindById = useMemo(
    () => new Map<string, CostKind>(categories.map((category) => [category.id, category.kind])),
    [categories],
  )

  const breakdown = useMemo(
    () => calculateMonthlyProfit(monthKey, costEntries, revenueEntries, categoryKindById),
    [monthKey, costEntries, revenueEntries, categoryKindById],
  )

  if (isLoadingCosts || isLoadingRevenue) {
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

      <p className="text-xs text-slate-500">
        Estes números refletem os lançamentos atuais, incluindo edições recentes — este app nunca "tranca" um mês
        passado.
      </p>
    </div>
  )
}
