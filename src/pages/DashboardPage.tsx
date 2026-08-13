import { useMemo, useState } from 'react'
import { useCostCategories } from '../features/costs/useCostCategories'
import { useCostEntries } from '../features/costs/useCostEntries'
import { useRevenueCategories } from '../features/revenue/useRevenueCategories'
import { useRevenueEntries } from '../features/revenue/useRevenueEntries'
import { MonthlyGoalCard } from '../features/reports/MonthlyGoalCard'
import { ProfitSummaryCard } from '../features/reports/ProfitSummaryCard'
import { calculateAccumulatedCash, calculateProfitForPeriod } from '../features/reports/profit'
import { DailyCashSummary } from '../features/revenue/DailyCashSummary'
import { WithdrawalForm } from '../features/withdrawals/WithdrawalForm'
import { WithdrawalList } from '../features/withdrawals/WithdrawalList'
import { useWithdrawals } from '../features/withdrawals/useWithdrawals'
import { getFirstDayOfCurrentMonthIso, getLastDayOfCurrentMonthIso } from '../lib/date'
import type { Business } from '../features/business/types'
import type { Withdrawal } from '../features/withdrawals/types'

interface DashboardPageProps {
  business: Business
  onManageGoal: () => void
}

export function DashboardPage({ business, onManageGoal }: DashboardPageProps) {
  const { categories: costCategories } = useCostCategories(business.id)
  const { categories: revenueCategories } = useRevenueCategories(business.id)
  const { entries: costEntries, isLoading: isLoadingCosts } = useCostEntries(business.id)
  const { entries: revenueEntries, isLoading: isLoadingRevenue } = useRevenueEntries(business.id)
  const {
    withdrawals,
    isLoading: isLoadingWithdrawals,
    createWithdrawal,
    updateWithdrawal,
    deleteWithdrawal,
  } = useWithdrawals(business.id)
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null)

  const startDate = getFirstDayOfCurrentMonthIso()
  const endDate = getLastDayOfCurrentMonthIso()
  const breakdown = useMemo(
    () => calculateProfitForPeriod(startDate, endDate, costEntries, revenueEntries, costCategories, revenueCategories),
    [startDate, endDate, costEntries, revenueEntries, costCategories, revenueCategories],
  )
  const cashCents = useMemo(
    () => calculateAccumulatedCash(costEntries, revenueEntries, withdrawals),
    [costEntries, revenueEntries, withdrawals],
  )

  if (isLoadingCosts || isLoadingRevenue || isLoadingWithdrawals) {
    return <p className="p-4 text-sm text-slate-500">Carregando...</p>
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <h1 className="text-lg font-bold text-slate-900">{business.name}</h1>
      <ProfitSummaryCard breakdown={breakdown} />
      <MonthlyGoalCard business={business} breakdown={breakdown} onManageGoal={onManageGoal} />
      <DailyCashSummary cashCents={cashCents} />
      <WithdrawalForm
        key={editingWithdrawal?.id ?? 'new'}
        withdrawalToEdit={editingWithdrawal}
        onCancelEdit={() => setEditingWithdrawal(null)}
        onSubmit={(input) =>
          editingWithdrawal ? updateWithdrawal(editingWithdrawal.id, input) : createWithdrawal(input)
        }
      />
      <WithdrawalList withdrawals={withdrawals} onEdit={setEditingWithdrawal} onDelete={deleteWithdrawal} />
    </div>
  )
}
