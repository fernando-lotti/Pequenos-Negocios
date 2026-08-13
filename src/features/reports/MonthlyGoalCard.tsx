import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { formatCurrencyBRL } from '../../lib/currency'
import { calculateGoalProgress } from './goalProgress'
import type { ProfitBreakdown } from './profit'
import type { Business } from '../business/types'

interface MonthlyGoalCardProps {
  business: Business
  // Sempre o breakdown do mês atual — a meta é sempre mensal (ver
  // MonthlyGoalForm.tsx e ADR em docs/ARCHITECTURE.md).
  breakdown: ProfitBreakdown
  onManageGoal: () => void
}

const GOAL_TYPE_LABEL: Record<'profit' | 'revenue', string> = {
  profit: 'lucro',
  revenue: 'faturamento',
}

// Mostrada no Dashboard, logo abaixo do lucro do mês. Sem meta definida,
// vira um convite pra configurar uma em Ajustes em vez de sumir — ajuda a
// pessoa a descobrir que a funcionalidade existe.
export function MonthlyGoalCard({ business, breakdown, onManageGoal }: MonthlyGoalCardProps) {
  if (!business.monthlyGoalCents || !business.monthlyGoalType) {
    return (
      <Card>
        <p className="font-semibold text-slate-900">Que tal definir uma meta do mês?</p>
        <p className="mt-1 text-sm text-slate-500">
          Acompanhe o progresso do seu lucro ou faturamento até uma meta que você escolher.
        </p>
        <PrimaryButton variant="secondary" className="mt-3" onClick={onManageGoal}>
          Definir meta
        </PrimaryButton>
      </Card>
    )
  }

  const currentCents = business.monthlyGoalType === 'profit' ? breakdown.profitCents : breakdown.revenueCents
  const { progressRatio, remainingCents, isReached } = calculateGoalProgress(
    business.monthlyGoalCents,
    currentCents,
  )
  const goalLabel = GOAL_TYPE_LABEL[business.monthlyGoalType]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Meta de {goalLabel} do mês</p>
        <button type="button" onClick={onManageGoal} className="text-xs font-medium text-emerald-700 underline">
          Editar
        </button>
      </div>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {formatCurrencyBRL(currentCents)}{' '}
        <span className="text-sm font-normal text-slate-500">de {formatCurrencyBRL(business.monthlyGoalCents)}</span>
      </p>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${isReached ? 'bg-emerald-600' : 'bg-emerald-500'}`}
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {isReached
          ? `Meta de ${goalLabel} batida esse mês! 🎉`
          : `Faltam ${formatCurrencyBRL(remainingCents)} pra bater a meta de ${goalLabel}.`}
      </p>
    </Card>
  )
}
