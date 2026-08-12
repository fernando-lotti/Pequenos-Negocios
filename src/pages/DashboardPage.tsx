import { useMemo } from 'react'
import { useCostCategories } from '../features/costs/useCostCategories'
import { useCostEntries } from '../features/costs/useCostEntries'
import { useRevenueEntries } from '../features/revenue/useRevenueEntries'
import { MonthlyProfitCard } from '../features/reports/MonthlyProfitCard'
import { calculateAccumulatedCash, calculateMonthlyProfit } from '../features/reports/profit'
import { DailyCashSummary } from '../features/revenue/DailyCashSummary'
import { getCurrentMonthKey } from '../lib/date'
import type { Business } from '../features/business/types'
import type { CostKind } from '../features/costs/types'

interface DashboardPageProps {
  business: Business
}

export function DashboardPage({ business }: DashboardPageProps) {
  const { categories } = useCostCategories(business.id)
  const { entries: costEntries, isLoading: isLoadingCosts } = useCostEntries(business.id)
  const { entries: revenueEntries, isLoading: isLoadingRevenue } = useRevenueEntries(business.id)

  const categoryKindById = useMemo(
    () => new Map<string, CostKind>(categories.map((category) => [category.id, category.kind])),
    [categories],
  )

  const monthKey = getCurrentMonthKey()
  const breakdown = useMemo(
    () => calculateMonthlyProfit(monthKey, costEntries, revenueEntries, categoryKindById),
    [monthKey, costEntries, revenueEntries, categoryKindById],
  )
  const cashCents = useMemo(
    () => calculateAccumulatedCash(costEntries, revenueEntries),
    [costEntries, revenueEntries],
  )

  if (isLoadingCosts || isLoadingRevenue) {
    return <p className="p-4 text-sm text-slate-500">Carregando...</p>
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <h1 className="text-lg font-bold text-slate-900">{business.name}</h1>
      <MonthlyProfitCard breakdown={breakdown} />
      <DailyCashSummary cashCents={cashCents} />
    </div>
  )
}
