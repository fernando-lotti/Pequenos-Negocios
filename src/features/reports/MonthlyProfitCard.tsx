import { Card } from '../../components/Card'
import { formatCurrencyBRL } from '../../lib/currency'
import { formatMonthKeyLabel } from '../../lib/date'
import type { MonthlyProfitBreakdown } from './profit'

interface MonthlyProfitCardProps {
  breakdown: MonthlyProfitBreakdown
}

// O destaque principal do produto: "quanto você realmente ganhou" (ver
// CLAUDE.md, objetivo #1). Mostra o lucro líquido bem grande, e o
// detalhamento por baixo pra quem quiser entender de onde veio o número.
export function MonthlyProfitCard({ breakdown }: MonthlyProfitCardProps) {
  const isProfit = breakdown.profitCents >= 0

  return (
    <Card>
      <p className="text-sm text-slate-600">Lucro líquido de {formatMonthKeyLabel(breakdown.monthKey)}</p>
      <p className={`mt-1 text-3xl font-bold ${isProfit ? 'text-emerald-700' : 'text-red-600'}`}>
        {formatCurrencyBRL(breakdown.profitCents)}
      </p>
      {!isProfit && <p className="mt-1 text-sm text-red-600">Os custos do mês superaram a receita.</p>}

      <dl className="mt-4 grid grid-cols-2 gap-y-2 border-t border-slate-100 pt-4 text-sm">
        <dt className="text-slate-500">Receita do mês</dt>
        <dd className="text-right font-medium text-slate-900">{formatCurrencyBRL(breakdown.revenueCents)}</dd>

        <dt className="text-slate-500">Custos fixos</dt>
        <dd className="text-right font-medium text-slate-900">{formatCurrencyBRL(breakdown.fixedCostCents)}</dd>

        <dt className="text-slate-500">Custos variáveis</dt>
        <dd className="text-right font-medium text-slate-900">{formatCurrencyBRL(breakdown.variableCostCents)}</dd>

        {breakdown.uncategorizedCostCents > 0 && (
          <>
            <dt className="text-slate-500">Sem categoria</dt>
            <dd className="text-right font-medium text-slate-900">
              {formatCurrencyBRL(breakdown.uncategorizedCostCents)}
            </dd>
          </>
        )}
      </dl>

      {breakdown.uncategorizedCostCents > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Alguns custos estão "sem categoria" porque a categoria deles foi excluída. Edite esses lançamentos na tela
          de Custos pra colocar numa categoria existente.
        </p>
      )}
    </Card>
  )
}
