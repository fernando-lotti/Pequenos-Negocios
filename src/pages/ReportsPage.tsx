import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { useCostCategories } from '../features/costs/useCostCategories'
import { useCostEntries } from '../features/costs/useCostEntries'
import { ConceptTip } from '../features/education/ConceptTip'
import { BreakEvenCard } from '../features/reports/BreakEvenCard'
import { ProfitSummaryCard } from '../features/reports/ProfitSummaryCard'
import { calculateProfitForPeriod, calculateWithdrawalsForPeriod, getEarliestEntryDate } from '../features/reports/profit'
import { useRevenueCategories } from '../features/revenue/useRevenueCategories'
import { useRevenueEntries } from '../features/revenue/useRevenueEntries'
import { useWithdrawals } from '../features/withdrawals/useWithdrawals'
import { PriceCalculator } from '../features/pricing/PriceCalculator'
import { formatCurrencyBRL } from '../lib/currency'
import {
  getFirstDayOfCurrentMonthIso,
  getFirstDayOfCurrentYearIso,
  getLastDayOfCurrentMonthIso,
  getLastDayOfCurrentYearIso,
  getTodayAsIsoDate,
} from '../lib/date'
import type { Business } from '../features/business/types'

interface ReportsPageProps {
  business: Business
}

export function ReportsPage({ business }: ReportsPageProps) {
  const { categories: costCategories } = useCostCategories(business.id)
  const { categories: revenueCategories } = useRevenueCategories(business.id)
  const { entries: costEntries, isLoading: isLoadingCosts } = useCostEntries(business.id)
  const { entries: revenueEntries, isLoading: isLoadingRevenue } = useRevenueEntries(business.id)
  const { withdrawals, isLoading: isLoadingWithdrawals } = useWithdrawals(business.id)
  const [startDate, setStartDate] = useState(getFirstDayOfCurrentMonthIso())
  const [endDate, setEndDate] = useState(getLastDayOfCurrentMonthIso())

  const breakdown = useMemo(
    () => calculateProfitForPeriod(startDate, endDate, costEntries, revenueEntries, costCategories, revenueCategories),
    [startDate, endDate, costEntries, revenueEntries, costCategories, revenueCategories],
  )

  const withdrawalsCents = useMemo(
    () => calculateWithdrawalsForPeriod(startDate, endDate, withdrawals),
    [startDate, endDate, withdrawals],
  )

  function selectCurrentMonth() {
    setStartDate(getFirstDayOfCurrentMonthIso())
    setEndDate(getLastDayOfCurrentMonthIso())
  }

  function selectCurrentYear() {
    setStartDate(getFirstDayOfCurrentYearIso())
    setEndDate(getLastDayOfCurrentYearIso())
  }

  function selectSinceBeginning() {
    setStartDate(getEarliestEntryDate(costEntries, revenueEntries) ?? getTodayAsIsoDate())
    setEndDate(getTodayAsIsoDate())
  }

  if (isLoadingCosts || isLoadingRevenue || isLoadingWithdrawals) {
    return <p className="p-4 text-sm text-slate-500">Carregando...</p>
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <h1 className="text-lg font-bold text-slate-900">Relatórios</h1>
      <ConceptTip conceptId="lucro_caixa" />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={selectCurrentMonth}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Mês atual
        </button>
        <button
          type="button"
          onClick={selectCurrentYear}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Ano atual
        </button>
        <button
          type="button"
          onClick={selectSinceBeginning}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Desde o início
        </button>
      </div>

      <div className="flex gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Início
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Fim
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <ProfitSummaryCard breakdown={breakdown} />

      <BreakEvenCard breakdown={breakdown} />

      <PriceCalculator />

      <Card>
        <p className="text-sm text-slate-600">Retiradas do período</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrencyBRL(withdrawalsCents)}</p>
        <p className="mt-1 text-xs text-slate-500">
          Dinheiro que você tirou do caixa pra uso pessoal — não é um custo do negócio, por isso não aparece
          descontado do lucro acima.
        </p>
      </Card>

      <p className="text-xs text-slate-500">
        Estes números refletem os lançamentos atuais, incluindo edições recentes — este app nunca "tranca" um período
        passado.
      </p>
    </div>
  )
}
