import { Card } from '../../components/Card'
import { formatCurrencyBRL } from '../../lib/currency'
import { getDayOfCurrentMonth, getDaysInCurrentMonth } from '../../lib/date'
import { calculateMonthEndProjection } from './monthEndProjection'
import type { ProfitBreakdown } from './profit'

interface MonthEndProjectionCardProps {
  // Breakdown do início do mês atual até HOJE (não até o fim do mês) — ver
  // DashboardPage.tsx. Usar o breakdown do mês inteiro contaria também
  // lançamentos com data futura dentro do mês (o app permite datar
  // lançamentos livremente), distorcendo a "média diária até agora".
  soFarBreakdown: ProfitBreakdown
}

// Estimativa simples de fim de mês: mantém a média diária de receita/custo
// observada até hoje e projeta pros dias que faltam (ver
// reports/monthEndProjection.ts). É só uma projeção, não um fato — por isso
// o texto deixa isso claro.
export function MonthEndProjectionCard({ soFarBreakdown }: MonthEndProjectionCardProps) {
  const projection = calculateMonthEndProjection(
    soFarBreakdown.revenueCents,
    soFarBreakdown.totalCostCents,
    getDayOfCurrentMonth(),
    getDaysInCurrentMonth(),
  )
  const isProfit = projection.projectedProfitCents >= 0

  return (
    <Card>
      <p className="text-sm text-slate-600">No ritmo atual, você deve fechar o mês com</p>
      <p className={`mt-1 text-2xl font-bold ${isProfit ? 'text-emerald-700' : 'text-red-600'}`}>
        {formatCurrencyBRL(projection.projectedProfitCents)}{' '}
        <span className="text-sm font-normal text-slate-500">de lucro</span>
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Projeção com base na média diária de receita e custo até hoje — não é garantido, é só uma estimativa pra
        ajudar a planejar o resto do mês. Fica mais confiável conforme o mês avança.
      </p>
    </Card>
  )
}
